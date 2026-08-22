import { NotSupportedError } from '../errors'
import { WooBaseService, minor } from './cart-service'

/**
 * CheckoutService — WooCommerce. Signatures mirror @misiki/litekart-connector.
 *
 * Placing an order is the Store API checkout endpoint:
 * POST /wp-json/wc/store/v1/checkout
 * { billing_address, shipping_address, payment_method, payment_data, customer_note }
 * -> { order_id, order_key, order_number, status, payment_result }
 * https://developer.woocommerce.com/docs/apis/store-api/resources-endpoints/checkout/
 *
 * WooCommerce core ships exactly ONE gateway that can be driven end to end from REST:
 * 'cod' (Cash on Delivery). Every other gateway (Razorpay, Stripe, PayPal, PhonePe,
 * Cashfree, Affirm) is a plugin: its gateway id and its `payment_data` key names are
 * defined by that plugin and are not discoverable from the REST API. Where the id can
 * at least be resolved at runtime from v3 GET /payment_gateways we do that instead of
 * hardcoding; where nothing exists in core the method stays a documented placeholder.
 *
 * There is NO capture/verify endpoint anywhere in WooCommerce. Gateways confirm payment
 * through their own WP webhook (?wc-api=<gateway_id>). PUT /orders/{id} { set_paid:true }
 * would mark an order paid WITHOUT verifying the PSP signature — a payment-fraud hole —
 * so every capture* method below is deliberately left unimplemented.
 */
export class CheckoutService extends WooBaseService {
  private static instance: CheckoutService
  static getInstance(): CheckoutService {
    if (!CheckoutService.instance) CheckoutService.instance = new CheckoutService()
    return CheckoutService.instance
  }

  /** v3 GET /payment_gateways — returns the first enabled gateway matching `candidates`. */
  private async resolveGatewayId(candidates: string[]): Promise<string | null> {
    const gateways = await this.get<any[]>('/payment_gateways')
    const list = Array.isArray(gateways) ? gateways : []
    for (const id of candidates) {
      const found = list.find((g) => g?.id === id && g?.enabled)
      if (found) return String(found.id)
    }
    return null
  }

  /** POST store /checkout using the addresses already persisted on the cart session. */
  private async placeOrder(cartId: string, paymentMethod: string, extra: Record<string, unknown> = {}): Promise<any> {
    const token = this.resolveCartToken(cartId)
    const cart = await this.storeRequest<any>('/cart', { method: 'GET', cartToken: token })
    return this.storeRequest<any>('/checkout', {
      method: 'POST',
      cartToken: token,
      body: {
        billing_address: cart?.billing_address ?? {},
        shipping_address: cart?.shipping_address ?? {},
        payment_method: paymentMethod,
        // payment_data key names are gateway-plugin defined; core gateways need none.
        payment_data: [],
        ...extra
      }
    })
  }

  /**
   * Cash on delivery. 'cod' is WooCommerce CORE's gateway id, so it is safe to use —
   * but it is verified as enabled first (v3 GET /payment_gateways/cod) so a
   * misconfigured store fails with a readable message instead of a checkout error.
   * Returns the raw Store API checkout result: { order_id, order_key, order_number,
   * status, payment_result }.
   */
  async checkoutCOD({ cartId, origin }: { cartId: string; origin: string }): Promise<any> {
    void origin // WooCommerce has no callback-origin concept for COD.
    const gateway = await this.get<any>('/payment_gateways/cod')
    if (!gateway?.enabled) {
      throw { message: 'Cash on delivery is not enabled for this store.' }
    }
    return this.placeOrder(cartId, 'cod')
  }

  /**
   * Shipping rates are a FIELD on the cart, not their own endpoint:
   * GET store /cart -> shipping_rates[] = [{ package_id, destination, shipping_rates:[...] }].
   * Rates only appear once an address has been set via POST /cart/update-customer.
   * Prices are integer minor units and are normalised here.
   */
  async getShippingRates({ cartId }: { cartId: string }): Promise<any> {
    const cart = await this.storeRequest<any>('/cart', {
      method: 'GET',
      cartToken: this.resolveCartToken(cartId)
    })
    const packages: any[] = Array.isArray(cart?.shipping_rates) ? cart.shipping_rates : []
    const rates = packages.flatMap((pkg) =>
      (Array.isArray(pkg?.shipping_rates) ? pkg.shipping_rates : []).map((rate: any) => ({
        id: rate?.rate_id,
        packageId: pkg?.package_id ?? 0,
        name: rate?.name,
        methodId: rate?.method_id,
        description: rate?.description ?? null,
        price: minor(rate?.price, rate?.currency_minor_unit),
        selected: Boolean(rate?.selected)
      }))
    )
    return { data: rates, needsShipping: Boolean(cart?.needs_shipping) }
  }

  /**
   * Razorpay is a plugin gateway; core WooCommerce does not ship it. The gateway id is
   * resolved at runtime rather than hardcoded, then the standard POST /checkout runs.
   * The plugin's redirect URL comes back in payment_result.redirect_url. Note that
   * `payment_data` cannot be supplied through litekart's signature — if the installed
   * plugin requires it, the checkout will fail with the plugin's own message.
   */
  async checkoutRazorpay({ cartId, origin }: { cartId: string; origin: string }): Promise<any> {
    void origin
    const gateway = await this.resolveGatewayId(['razorpay'])
    if (!gateway) {
      throw new NotSupportedError('CheckoutService', 'checkoutRazorpay', 'no enabled Razorpay gateway found on this store')
    }
    return this.placeOrder(cartId, gateway)
  }

  /**
   * PayPal is a plugin gateway ('ppcp-gateway' for WooCommerce PayPal Payments, 'paypal'
   * for the legacy standard gateway). There is no core /checkout/paypal route.
   */
  async checkoutPaypal({ cartId, origin, return_url }: { cartId: string; origin: string; return_url: string }): Promise<any> {
    void origin
    void return_url // The gateway plugin owns its return URL; Store API takes no such field.
    const gateway = await this.resolveGatewayId(['ppcp-gateway', 'paypal'])
    if (!gateway) {
      throw new NotSupportedError('CheckoutService', 'checkoutPaypal', 'no enabled PayPal gateway found on this store')
    }
    return this.placeOrder(cartId, gateway)
  }

  /**
   * Stripe is a plugin gateway ('stripe' for WooCommerce Stripe Gateway, 'stripe_cc' for
   * Stripe by Payment Plugins). Its `payment_data` must carry the PaymentMethod token
   * created client-side by Stripe.js, which litekart's { cartId, origin } signature has
   * nowhere to put — so this will only succeed on stores whose Stripe plugin is
   * configured for a redirect/hosted flow.
   */
  async checkoutStripe({ cartId, origin }: { cartId: string; origin: string }): Promise<any> {
    void origin
    const gateway = await this.resolveGatewayId(['stripe', 'stripe_cc'])
    if (!gateway) {
      throw new NotSupportedError('CheckoutService', 'checkoutStripe', 'no enabled Stripe gateway found on this store')
    }
    return this.placeOrder(cartId, gateway)
  }

  // PhonePe is an India-specific third-party gateway with no core WooCommerce presence and no documented REST route.
  async checkoutPhonepe(_args: { cartId: string; email: string; phone: string; origin: string }): Promise<any> {
    return this.dummy({})
  }

  // Cashfree is a third-party gateway plugin; no core REST route exists. (litekart keeps its Cashfree flow on order-service.)
  async checkoutCashfree(..._args: any[]): Promise<any> {
    return this.dummy({})
  }

  // No point-of-sale concept in WooCommerce core REST. The nearest equivalent, v3 POST /orders { set_paid:true }, marks an order paid with no tender and bypasses the cart.
  async checkoutPOS(_args: { cartId: string; origin: string }): Promise<any> {
    return this.dummy({})
  }

  // No capture endpoint exists in WooCommerce; Razorpay confirms via its own WP webhook (?wc-api=razorpay) and PUT /orders/{id} { set_paid:true } would skip signature verification.
  async captureRazorpayPayment(_args: { razorpay_order_id: string; razorpay_payment_id: string }): Promise<any> {
    return this.dummy({})
  }

  // Same as captureRazorpayPayment — PhonePe capture happens in the plugin's webhook handler, not over REST.
  async capturePhonepePayment(_args: { phonepe_order_id: string; phonepe_payment_id: string }): Promise<any> {
    return this.dummy({})
  }

  // Same as captureRazorpayPayment — Cashfree capture happens in the plugin's webhook handler, not over REST.
  async captureCashfreePayment(..._args: any[]): Promise<any> {
    return this.dummy({})
  }

  // Same as captureRazorpayPayment — Stripe capture happens in the plugin's webhook handler, not over REST.
  async checkoutStripeCapture(_args: { order_no: string; pg: string; payment_session_id: string; storeId: string }): Promise<any> {
    return this.dummy({})
  }

  // Affirm is a plugin gateway with no core REST route for creating a hosted Affirm order.
  async createAffirmPayOrder(_args: { cartId: string; addressId: string; origin: string; storeId: string; paymentMethodId: string }): Promise<any> {
    return this.dummy({})
  }

  // No core route; v3 PUT /orders/{id} { status:'cancelled' } cancels the WooCommerce order but never tells Affirm.
  async cancelAffirmOrder(_args: { orderId: string; storeId: string; origin: string }): Promise<any> {
    return this.dummy({})
  }

  // No core route for confirming an Affirm checkout token.
  async confirmAffirmOrder(_args: { affirmToken: string; orderId: string; storeId: string; origin: string }): Promise<any> {
    return this.dummy({})
  }
}

// // Use singleton instance
export const checkoutService = CheckoutService.getInstance()
