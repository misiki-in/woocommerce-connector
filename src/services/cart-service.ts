import type { Cart, CartLineItem } from '../types'
import { BaseService, STORE_API_BASE } from './base.service'

/**
 * CartService — WooCommerce. Signatures mirror @misiki/litekart-connector.
 *
 * WooCommerce v3 has NO cart endpoints at all; every cart operation lives on the
 * public Store API (/wp-json/wc/store/v1). Docs:
 * https://developer.woocommerce.com/docs/apis/store-api/resources-endpoints/cart/
 *
 * SESSION HANDLING — read this before debugging a 403:
 * Store API carts are session scoped and are NOT addressable by id. The only headless
 * way to keep (or target) a cart is the `Cart-Token` JWT, and every write additionally
 * needs a `Nonce`. Both are returned as RESPONSE headers that the client must capture
 * and replay (https://developer.woocommerce.com/docs/apis/store-api/cart-tokens/ and
 * .../nonce-tokens/). BaseService.request() only returns the parsed body and
 * storeGet/storePost take no per-request headers, so this service does the header
 * capture/replay itself in `storeRequest` below.
 */

/** Store API session tokens captured from response headers and replayed on the next call. */
export const storeSession: { cartToken: string | null; nonce: string | null } = {
  cartToken: null,
  nonce: null
}

const CART_ID_KEY = 'cart_id'

/** localStorage is not available during SSR — read/write defensively. */
function readStoredCartId(): string | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage.getItem(CART_ID_KEY)
  } catch {
    return null
  }
}
function writeStoredCartId(value: string | null): void {
  try {
    if (typeof localStorage === 'undefined' || !value) return
    localStorage.setItem(CART_ID_KEY, value)
  } catch {
    /* ignore */
  }
}

/** Store API prices are INTEGER MINOR UNITS (1999 + currency_minor_unit 2 => 19.99). */
export function minor(value: unknown, minorUnit: unknown): number {
  const n = typeof value === 'string' ? parseFloat(value) : (value as number)
  if (!Number.isFinite(n)) return 0
  const unit = Number(minorUnit)
  return Number.isFinite(unit) && unit > 0 ? n / Math.pow(10, unit) : n
}

/**
 * BaseService + Store API session handling (Cart-Token / Nonce), which the shared base
 * class does not surface. Pagination is NOT redefined here: BaseService.getPaged()
 * already reads the real X-WP-Total / X-WP-TotalPages response headers and takes a
 * namespace argument, so this class inherits it unchanged.
 *
 * Exported so checkout-service, order-service, coupon-service and payment-method-service
 * can use the Store API helpers.
 */
export class WooBaseService extends BaseService {
  /**
   * Issue a Store API request, replaying the captured `Cart-Token`/`Nonce` headers and
   * re-capturing them from the response. `cartToken` overrides the cached token so a
   * caller that persisted a cart id (litekart passes `cartId` everywhere) can target it.
   */
  protected async storeRequest<T = any>(
    path: string,
    init: { method: string; body?: unknown; cartToken?: string | null } = { method: 'GET' }
  ): Promise<T> {
    const token = init.cartToken || storeSession.cartToken
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    }
    if (token) headers['Cart-Token'] = token
    if (storeSession.nonce) headers['Nonce'] = storeSession.nonce

    let res: Response
    try {
      res = await this._fetch(this.url(path, STORE_API_BASE), {
        method: init.method,
        headers,
        body: init.body === undefined ? undefined : JSON.stringify(init.body)
      })
    } catch {
      throw { message: 'Unable to reach the server. Please try again in a moment.' }
    }

    const returnedToken = res.headers.get('Cart-Token')
    if (returnedToken) {
      storeSession.cartToken = returnedToken
      writeStoredCartId(returnedToken)
    }
    const returnedNonce = res.headers.get('Nonce')
    if (returnedNonce) storeSession.nonce = returnedNonce

    let body: any = {}
    try {
      body = await res.json()
    } catch {
      body = {}
    }
    if (!res.ok) throw this.toError(body, `Request failed with status ${res.status}`)
    return body as T
  }

  /** Current cart token: explicit argument > captured header > persisted localStorage value. */
  protected resolveCartToken(cartId?: string | null): string | null {
    if (cartId && cartId !== 'undefined' && cartId !== 'null') return cartId
    return storeSession.cartToken || readStoredCartId()
  }
}

/** Map a Store API cart payload into the shared Cart shape. */
export function mapStoreCart(raw: any, opts: { storeId?: string; cartId?: string | null } = {}): Cart {
  const totals = raw?.totals || {}
  const unit = totals.currency_minor_unit
  const items: any[] = Array.isArray(raw?.items) ? raw.items : []

  const lineItems: CartLineItem[] = items.map((it) => {
    const itemUnit = it?.prices?.currency_minor_unit ?? unit
    const isVariation = Array.isArray(it?.variation) && it.variation.length > 0
    return {
      // `key` is WooCommerce's cart-item hash — it is what remove-item/update-item expect.
      id: String(it?.key ?? ''),
      productId: String(it?.id ?? ''),
      variantId: isVariation ? String(it?.id ?? '') : '',
      qty: Number(it?.quantity ?? 0),
      price: minor(it?.prices?.price, itemUnit),
      total: minor(it?.totals?.line_total, it?.totals?.currency_minor_unit ?? unit)
    }
  })

  const savingAmount = items.reduce((sum, it) => {
    const itemUnit = it?.prices?.currency_minor_unit ?? unit
    const mrp = minor(it?.prices?.regular_price, itemUnit)
    const price = minor(it?.prices?.price, itemUnit)
    return sum + Math.max(0, mrp - price) * Number(it?.quantity ?? 0)
  }, 0)

  // shipping_rates is an array of packages, each carrying its own shipping_rates[].
  const packages: any[] = Array.isArray(raw?.shipping_rates) ? raw.shipping_rates : []
  const selectedRate = packages
    .flatMap((p) => (Array.isArray(p?.shipping_rates) ? p.shipping_rates : []))
    .find((r: any) => r?.selected)

  const paymentMethods: string[] = Array.isArray(raw?.payment_methods) ? raw.payment_methods : []
  const shippingCountry = raw?.shipping_address?.country

  return {
    // Store API carts have no id of their own — the Cart-Token IS the handle.
    id: String(opts.cartId ?? storeSession.cartToken ?? ''),
    email: raw?.billing_address?.email || null,
    phone: raw?.billing_address?.phone || null,
    lineItems,
    billingAddressId: null,
    shippingAddressId: null,
    regionId: null,
    userId: null,
    salesChannelId: null,
    storeId: opts.storeId ?? null,
    couponCode: raw?.coupons?.[0]?.code ?? null,
    discountAmount: minor(totals.total_discount, unit),
    couponAppliedDate: null,
    paymentId: null,
    paymentMethod: null,
    paymentAuthorizedAt: null,
    needAddress: Boolean(raw?.needs_shipping) && !shippingCountry,
    isCodAvailable: paymentMethods.includes('cod'),
    type: 'cart',
    completedAt: null,
    idempotencyKey: null,
    shippingCharges: minor(totals.total_shipping, unit),
    shippingMethod: selectedRate?.name ?? null,
    qty: Number(raw?.items_count ?? lineItems.reduce((s, l) => s + l.qty, 0)),
    subtotal: minor(totals.total_items, unit),
    codCharges: 0,
    tax: minor(totals.total_tax, unit),
    total: minor(totals.total_price, unit),
    savingAmount
  }
}

export class CartService extends WooBaseService {
  private static instance: CartService
  static getInstance(): CartService {
    if (!CartService.instance) CartService.instance = new CartService()
    return CartService.instance
  }

  private toCart(raw: any, cartId?: string | null): Cart {
    return mapStoreCart(raw, { storeId: this.creds.storeId, cartId: this.resolveCartToken(cartId) })
  }

  /** GET store /cart — the session's cart, items, totals, shipping rates and coupons. */
  async fetchCartData(): Promise<Cart> {
    const raw = await this.storeRequest<any>('/cart', {
      method: 'GET',
      cartToken: this.resolveCartToken()
    })
    return this.toCart(raw)
  }

  /** No "refresh" route exists; a plain GET /cart re-reads and re-totals the session. */
  async refereshCart(): Promise<Cart> {
    return this.fetchCartData()
  }

  /**
   * There is no /cart/{id} path — carts are session scoped. The only way to target a
   * specific cart headlessly is to send its JWT as the `Cart-Token` request header,
   * so `cartId` is treated as that token.
   * https://developer.woocommerce.com/docs/apis/store-api/cart-tokens/
   */
  async getCartByCartId(cartId: string): Promise<Cart> {
    const raw = await this.storeRequest<any>('/cart', { method: 'GET', cartToken: cartId })
    return this.toCart(raw, cartId)
  }

  /**
   * Add a line, update it when `lineId` is supplied, or remove it on litekart's
   * -9999999 sentinel quantity.
   * POST /cart/add-item { id, quantity, variation } — for a variable product `id` must
   * be the VARIATION id, not the parent.
   */
  async addToCart({
    productId,
    variantId,
    qty,
    cartId,
    lineId
  }: {
    productId: string
    variantId: string
    qty: number
    cartId?: string | null
    lineId: string | null
  }): Promise<Cart> {
    const token = this.resolveCartToken(cartId)

    if (qty === -9999999) {
      // litekart's "remove this line" sentinel.
      return this.removeCart({ cartId: token as string, lineId })
    }

    let raw: any
    if (lineId) {
      raw = await this.storeRequest('/cart/update-item', {
        method: 'POST',
        cartToken: token,
        body: { key: lineId, quantity: qty }
      })
    } else {
      const id = Number(variantId || productId)
      raw = await this.storeRequest('/cart/add-item', {
        method: 'POST',
        cartToken: token,
        body: { id, quantity: qty, variation: [] }
      })
    }

    // /cart/add-item and /cart/update-item both return the full cart, but the REST-style
    // aliases (/cart/items) return only the item — re-read when the shape is not a cart.
    if (!raw || !Array.isArray(raw.items) || !raw.totals) {
      raw = await this.storeRequest('/cart', { method: 'GET', cartToken: this.resolveCartToken(cartId) })
    }
    return this.toCart(raw, cartId)
  }

  /**
   * POST /cart/remove-item { key } — `key` is the cart-item hash (items[].key), NOT a
   * numeric line id.
   *
   * With NO lineId this is a no-op that just re-reads the cart, matching litekart, whose
   * removeCart() only issues a DELETE when `lineId` is set. Do NOT "helpfully" fall back
   * to DELETE /cart/items here: that route exists and empties the entire cart, so every
   * caller that passes `lineId: null` (the parameter default) would silently lose the
   * whole basket.
   */
  async removeCart({ cartId, lineId = null }: { cartId: string; lineId: string | null }): Promise<Cart> {
    const token = this.resolveCartToken(cartId)
    if (lineId) {
      const raw = await this.storeRequest<any>('/cart/remove-item', {
        method: 'POST',
        cartToken: token,
        body: { key: lineId }
      })
      return this.toCart(raw, cartId)
    }
    const raw = await this.storeRequest<any>('/cart', { method: 'GET', cartToken: token })
    return this.toCart(raw, cartId)
  }

  /**
   * POST /cart/apply-coupon { code }. This — not v3 /coupons — is the shopper-facing
   * validator: it checks usage limits and minimum spend against THIS cart and throws
   * woocommerce_rest_cart_coupon_error with a human message when the code is invalid.
   */
  async applyCoupon({ cartId, couponCode }: { cartId: string; couponCode: string }): Promise<Cart> {
    const raw = await this.storeRequest<any>('/cart/apply-coupon', {
      method: 'POST',
      cartToken: this.resolveCartToken(cartId),
      body: { code: couponCode }
    })
    return this.toCart(raw, cartId)
  }

  /**
   * POST /cart/remove-coupon { code } — `code` is REQUIRED but litekart's signature
   * takes no argument, so the applied codes are read from GET /cart first and removed
   * one by one.
   */
  async removeCoupon(): Promise<Cart> {
    const token = this.resolveCartToken()
    let raw: any = await this.storeRequest('/cart', { method: 'GET', cartToken: token })
    const codes: string[] = (Array.isArray(raw?.coupons) ? raw.coupons : [])
      .map((c: any) => c?.code)
      .filter(Boolean)
    for (const code of codes) {
      raw = await this.storeRequest('/cart/remove-coupon', {
        method: 'POST',
        cartToken: token,
        body: { code }
      })
    }
    return this.toCart(raw)
  }

  /**
   * Persist customer/billing/shipping details on the cart and re-run shipping + tax.
   * POST /cart/update-customer { billing_address, shipping_address } using WooCommerce
   * field names — litekart's zip -> postcode and countryCode -> country. `landmark` has
   * no WooCommerce home, so it is folded into address_2.
   */
  async updateCart2({
    storeId,
    cartId,
    email,
    billingAddress,
    customer_id,
    shippingAddress,
    phone,
    isBillingAddressSameAsShipping
  }: any): Promise<Cart> {
    void storeId
    void customer_id // WooCommerce derives the customer from the session, not the body.
    const token = this.resolveCartToken(cartId)

    const toWoo = (a: any) => {
      if (!a) return undefined
      const address2 = [a.address_2, a.landmark].filter(Boolean).join(', ')
      return {
        first_name: a.firstName ?? '',
        last_name: a.lastName ?? '',
        company: a.company ?? '',
        address_1: a.address_1 ?? '',
        address_2: address2,
        city: a.city ?? '',
        state: a.state ?? '',
        postcode: a.zip ?? '',
        country: a.countryCode || 'IN',
        email: a.email ?? email ?? '',
        phone: a.phone ?? phone ?? ''
      }
    }

    const shipping = toWoo(shippingAddress)
    const billingSource = isBillingAddressSameAsShipping ? shippingAddress : billingAddress
    const billing = toWoo(billingSource)

    const body: Record<string, unknown> = {}
    if (billing) body.billing_address = billing
    if (shipping) body.shipping_address = shipping

    const raw = await this.storeRequest<any>('/cart/update-customer', {
      method: 'POST',
      cartToken: token,
      body
    })
    return this.toCart(raw, cartId)
  }

  /**
   * Placing the order is the CHECKOUT endpoint, not a cart route.
   * https://developer.woocommerce.com/docs/apis/store-api/resources-endpoints/checkout/
   * The addresses already on the cart are reused; payment_method must be supplied by the
   * caller-facing checkout service, so this uses WooCommerce core's 'cod' gateway.
   */
  async completeCart(cart_id: string): Promise<Cart> {
    const token = this.resolveCartToken(cart_id)
    const cart = await this.storeRequest<any>('/cart', { method: 'GET', cartToken: token })
    const order = await this.storeRequest<any>('/checkout', {
      method: 'POST',
      cartToken: token,
      body: {
        billing_address: cart?.billing_address ?? {},
        shipping_address: cart?.shipping_address ?? {},
        payment_method: 'cod',
        payment_data: []
      }
    })
    // Hand back a cart-shaped payload carrying the placed order's identifiers.
    const mapped = this.toCart(cart, cart_id)
    mapped.paymentId = order?.order_id != null ? String(order.order_id) : null
    mapped.paymentMethod = order?.payment_method ?? 'cod'
    mapped.completedAt = new Date().toISOString()
    return mapped
  }

  /** Change a line quantity: POST /cart/update-item { key, quantity }. */
  async updateCart({ qty, cartId, lineId = null, productId, variantId, isSelectedForCheckout }: any): Promise<Cart> {
    void isSelectedForCheckout // WooCommerce has no per-line "selected for checkout" flag.
    const token = this.resolveCartToken(cartId)
    if (!lineId) {
      // No key yet -> this is really an add.
      return this.addToCart({ productId, variantId, qty, cartId: token, lineId: null })
    }
    const raw = await this.storeRequest<any>('/cart/update-item', {
      method: 'POST',
      cartToken: token,
      body: { key: lineId, quantity: qty }
    })
    return this.toCart(raw, cartId)
  }

  /**
   * POST /cart/select-shipping-rate { package_id, rate_id }. Both come from
   * GET /cart -> shipping_rates[].package_id and .shipping_rates[].rate_id
   * (e.g. 'flat_rate:3'). package_id is required; it is looked up rather than assumed.
   */
  async updateShippingRate({ cartId, shippingRateId }: { cartId: string; shippingRateId: string }): Promise<Cart> {
    const token = this.resolveCartToken(cartId)
    const cart = await this.storeRequest<any>('/cart', { method: 'GET', cartToken: token })
    const packages: any[] = Array.isArray(cart?.shipping_rates) ? cart.shipping_rates : []
    const owning = packages.find((p) =>
      (Array.isArray(p?.shipping_rates) ? p.shipping_rates : []).some((r: any) => r?.rate_id === shippingRateId)
    )
    const raw = await this.storeRequest<any>('/cart/select-shipping-rate', {
      method: 'POST',
      cartToken: token,
      body: { package_id: owning?.package_id ?? 0, rate_id: shippingRateId }
    })
    return this.toCart(raw, cartId)
  }
}

// // Use singleton instance
export const cartService = CartService.getInstance()
