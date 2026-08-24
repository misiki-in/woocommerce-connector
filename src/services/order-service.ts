import type { CartLineItem, Order, PaginatedResponse } from '../types'
import { WooBaseService } from './cart-service'

/**
 * OrderService — WooCommerce. Signatures mirror the storefront contract.
 *
 * Orders are the authenticated v3 surface:
 * https://woocommerce.github.io/woocommerce-rest-api-docs/#orders
 *
 * WooCommerce is single-vendor, has no order-number route, no carrier tracking, no
 * public order list and no OTP lookup — the methods that depend on those stay
 * placeholders below rather than pointing at a path that would 404 in a real store.
 */

const PER_PAGE = 20

const num = (v: unknown): number => {
  const n = typeof v === 'string' ? parseFloat(v) : (v as number)
  return Number.isFinite(n) ? n : 0
}

/**
 * The storefront sorts with a single '-field' string; WooCommerce always uses orderby + order.
 *
 * The /orders orderby enum is EXACTLY date | id | include | title | slug. WordPress core
 * also accepts `modified`, but WooCommerce's CRUD controller narrows the enum, so
 * `orderby=modified` is rejected with 400 rest_invalid_param — `updatedAt` therefore
 * degrades to `date` rather than hard-failing the whole list call.
 * https://woocommerce.github.io/woocommerce-rest-api-docs/#list-all-orders
 */
const ORDERBY_ENUM = new Set(['date', 'id', 'include', 'title', 'slug'])

function toOrderBy(sort?: string): { orderby: string; order: string } {
  const raw = (sort || '-createdAt').trim()
  const order = raw.startsWith('-') ? 'desc' : 'asc'
  const field = raw.replace(/^-/, '')
  const map: Record<string, string> = {
    createdAt: 'date',
    created_at: 'date',
    date: 'date',
    updatedAt: 'date',
    modified: 'date',
    id: 'id',
    orderNo: 'id',
    title: 'title',
    slug: 'slug'
  }
  const orderby = map[field] || 'date'
  return { orderby: ORDERBY_ENUM.has(orderby) ? orderby : 'date', order }
}

/** Map a v3 order (money is a decimal STRING here, unlike the Store API's minor units). */
export function mapOrder(raw: any): Order {
  const items: any[] = Array.isArray(raw?.line_items) ? raw.line_items : []
  const lineItems: CartLineItem[] = items.map((li) => ({
    id: String(li?.id ?? ''),
    productId: String(li?.product_id ?? ''),
    variantId: li?.variation_id ? String(li.variation_id) : '',
    qty: Number(li?.quantity ?? 0),
    price: num(li?.price),
    total: num(li?.total)
  }))
  return {
    id: String(raw?.id ?? ''),
    status: String(raw?.status ?? ''),
    total: num(raw?.total),
    // WooCommerce has no `subtotal` field on an order — it is the sum of the line subtotals.
    subtotal: items.reduce((s, li) => s + num(li?.subtotal), 0),
    tax: num(raw?.total_tax),
    currency: raw?.currency ?? null,
    createdAt: raw?.date_created ?? raw?.date_created_gmt ?? '',
    lineItems
  }
}

export class OrderService extends WooBaseService {
  private static instance: OrderService
  static getInstance(): OrderService {
    if (!OrderService.instance) OrderService.instance = new OrderService()
    return OrderService.instance
  }

  /**
   * GET /orders.
   *
   * SECURITY: WooCommerce's ck/cs key identifies the APPLICATION, not a shopper, so an
   * unscoped GET /orders returns EVERY order in the store. A storefront must therefore
   * pass `customer` (the WooCommerce customer id); without it this behaves as the admin
   * list. `customer` and `status` are optional additions to the storefront's { page, q, sort }
   * bag, so existing callers keep working unchanged.
   */
  async list({
    page = 1,
    q = '',
    sort = '-createdAt',
    customer,
    status
  }: { page?: number; q?: string; sort?: string; customer?: string | number; status?: string } = {}): Promise<
    PaginatedResponse<Order>
  > {
    const { orderby, order } = toOrderBy(sort)
    const { data, total, totalPages } = await this.getPaged<any>(
      '/orders' + this.qs({ page, per_page: PER_PAGE, search: q, orderby, order, customer, status })
    )
    return { data: data.map(mapOrder), count: total, pageSize: PER_PAGE, noOfPage: totalPages, page }
  }

  /** GET /orders/{id}. */
  async fetchOrder(id: string): Promise<Order> {
    return mapOrder(await this.get<any>(`/orders/${id}`))
  }

  /**
   * WooCommerce has no lookup-by-order-number route. On a stock install `number` === `id`,
   * so GET /orders/{orderNo} is tried first; sequential-order-number plugins break that,
   * so we fall back to GET /orders?search= and require an EXACT match on `number`/`id`.
   *
   * There is deliberately no "first result" fallback: WooCommerce's order `search` runs
   * wc_order_search(), which also matches billing address fields, so an order number that
   * happens to appear in some other shopper's postcode/phone would otherwise be handed
   * back as if it were the requested order.
   */
  async getOrder(orderNo: string): Promise<Order> {
    if (/^\d+$/.test(String(orderNo))) {
      try {
        const direct = await this.get<any>(`/orders/${orderNo}`)
        if (direct?.id) return mapOrder(direct)
      } catch {
        /* not a raw order id on this install — fall through to the search below */
      }
    }
    const list = await this.get<any[]>('/orders' + this.qs({ search: orderNo, per_page: PER_PAGE }))
    const arr = Array.isArray(list) ? list : []
    const match = arr.find((o) => String(o?.number) === String(orderNo) || String(o?.id) === String(orderNo))
    if (!match) throw { message: `Order ${orderNo} was not found.` }
    return mapOrder(match)
  }

  /** The storefront contract just re-reads the order; WooCommerce has no "record a page hit" side effect. */
  async paySuccessPageHit(orderId: string): Promise<Order> {
    return mapOrder(await this.get<any>(`/orders/${orderId}`))
  }

  /**
   * Degraded tracking: WooCommerce core has NO shipment-tracking resource (that is the
   * Shipment Tracking plugin, in its own namespace). This returns the order itself so the
   * caller can show status + date_completed as a timeline — it is NOT carrier tracking.
   */
  async fetchTrackOrder(id: string): Promise<PaginatedResponse<Order>> {
    const order = mapOrder(await this.get<any>(`/orders/${id}`))
    return { data: [order], count: 1, pageSize: 1, noOfPage: 1, page: 1 }
  }

  /**
   * Place a Cash-on-Delivery order for the current cart.
   * POST store /checkout { billing_address, shipping_address, payment_method: 'cod' }
   * https://developer.woocommerce.com/docs/apis/store-api/resources-endpoints/checkout/
   * 'cod' is a WooCommerce CORE gateway id, so it is safe to use directly.
   */
  async codCheckout({ address, cartId, origin, paymentMethod, paymentProviderId, prescription }: any): Promise<Order> {
    void origin
    void paymentProviderId // WooCommerce identifies a gateway by its id, not a provider id.
    void prescription // No WooCommerce field for this; a caller can send it as a customer_note.
    const token = this.resolveCartToken(cartId)

    const toWoo = (a: any) =>
      a
        ? {
            first_name: a.firstName ?? '',
            last_name: a.lastName ?? '',
            company: a.company ?? '',
            address_1: a.address_1 ?? '',
            address_2: [a.address_2, a.landmark].filter(Boolean).join(', '),
            city: a.city ?? '',
            state: a.state ?? '',
            postcode: a.zip ?? '',
            country: a.countryCode || 'IN',
            email: a.email ?? '',
            phone: a.phone ?? ''
          }
        : undefined

    const supplied = toWoo(address)
    if (supplied) {
      // Persist the address on the cart session first so shipping and tax recalculate.
      await this.storeRequest('/cart/update-customer', {
        method: 'POST',
        cartToken: token,
        body: { billing_address: supplied, shipping_address: supplied }
      })
    }
    const cart = await this.storeRequest<any>('/cart', { method: 'GET', cartToken: token })
    const result = await this.storeRequest<any>('/checkout', {
      method: 'POST',
      cartToken: token,
      body: {
        billing_address: supplied ?? cart?.billing_address ?? {},
        shipping_address: supplied ?? cart?.shipping_address ?? {},
        payment_method: paymentMethod || 'cod',
        payment_data: []
      }
    })

    // The checkout response carries no line items or totals — re-read the full order.
    if (result?.order_id) {
      try {
        return mapOrder(await this.get<any>(`/orders/${result.order_id}`))
      } catch {
        /* read-scope key missing: fall through to the thin mapping below */
      }
    }
    return {
      id: String(result?.order_id ?? ''),
      status: String(result?.status ?? ''),
      total: 0,
      subtotal: 0,
      tax: 0,
      currency: null,
      createdAt: '',
      lineItems: []
    }
  }

  /**
   * POST /products/reviews { product_id, review, reviewer, reviewer_email, rating }.
   * WooCommerce requires reviewer + reviewer_email, which the storefront's arg bag does not
   * carry, so they are read from optional extra keys when present.
   * `variantId` and `uploadedImages` are DROPPED: WooCommerce reviews attach to the
   * parent product only and have no image field.
   */
  async submitReview({ rating, review, productId, variantId, uploadedImages, reviewer, reviewerEmail, name, email }: any): Promise<any> {
    void variantId
    void uploadedImages
    return this.post<any>('/products/reviews', {
      product_id: Number(productId),
      review,
      rating: Number(rating),
      reviewer: reviewer ?? name ?? '',
      reviewer_email: reviewerEmail ?? email ?? ''
    })
  }

  // WooCommerce has no parent/child order split (the storefront contract splits one order per vendor; Woo is single-vendor). The only child objects an order has are refunds: GET /orders/{id}/refunds.
  async listOrdersByParent(_args: { orderNo: string | null; cartId: string | null }): Promise<any> {
    return this.emptyPage<Order>()
  }

  // Third-party gateway with no core WooCommerce route; its payment_data keys are plugin-defined. See checkout-service.
  async cashfreeCheckout(_args: any): Promise<any> {
    return this.dummy({})
  }

  // Third-party gateway with no core WooCommerce route. checkoutService.checkoutRazorpay() resolves the gateway id at runtime instead.
  async razorpayCheckout(_args: any): Promise<any> {
    return this.dummy({})
  }

  // Plugin gateway; its payment_data keys (the Stripe.js PaymentMethod token) are not discoverable via REST. See checkout-service.
  async stripeCheckout(_args: any): Promise<any> {
    return this.dummy({})
  }

  // No capture endpoint exists in WooCommerce; PUT /orders/{id} { set_paid:true } would mark the order paid without verifying the PSP signature.
  async razorCapture(_args: any): Promise<any> {
    return this.dummy({})
  }

  // Orders are never public in WooCommerce: there is no unauthenticated order list on v3 or the Store API.
  async listPublic(): Promise<any> {
    return this.emptyPage<Order>()
  }

  // There is no OTP flow. The only keyless shopper lookup is store GET /order/{id}?key=<order_key>&billing_email=<email>, which needs the order id + the key from the confirmation email — neither is available here.
  async getOrderByEmailAndOTP(_args: { email: string; otp: string }): Promise<any> {
    return this.emptyPage<Order>()
  }

  // No reorder endpoint. It has to be composed: GET /orders?customer=<id> -> line_items[].product_id/variation_id -> store POST /cart/add-item for each, and no customer id is available on this signature.
  async buyAgain(): Promise<any> {
    return this.emptyPage<Order>()
  }
}

// Use singleton instance
export const orderService = OrderService.getInstance()
