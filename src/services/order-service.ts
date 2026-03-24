<<<<<<< HEAD
import { PAGE_SIZE } from '../config'
import type { PaginatedResponse, Order } from './../types'
import { BaseService } from './base-service'
import { cartService } from './cart-service'

type WooCommerceOrder = {
  id: number
  parent_id: number
  status: string
  currency: string
  version: string
  prices_include_tax: boolean
  date_created: string
  date_created_gmt: string
  date_modified: string
  date_modified_gmt: string
  discount_total: string
  discount_tax: string
  shipping_total: string
  shipping_tax: string
  cart_tax: string
  total: string
  total_tax: string
  customer_id: number
  customer_note: string
  billing: {
    first_name: string
    last_name: string
    company: string
    address_1: string
    address_2: string
    city: string
    state: string
    postcode: string
    country: string
    email: string
    phone: string
  }
  shipping: {
    first_name: string
    last_name: string
    company: string
    address_1: string
    address_2: string
    city: string
    state: string
    postcode: string
    country: string
  }
  payment_method: string
  payment_method_title: string
  transaction_id: string
  date_paid: string
  date_paid_gmt: string
  date_completed: string
  date_completed_gmt: string
  meta_data: any[]
  line_items: Array<{
    id: number
    name: string
    product_id: number
    variation_id: number
    quantity: number
    tax_class: string
    subtotal: string
    subtotal_tax: string
    total: string
    total_tax: string
    taxes: any[]
    meta_data: any[]
    sku: string
    price: number
  }>
  tax_lines: any[]
  shipping_lines: any[]
  fee_lines: any[]
  coupon_lines: any[]
  refunds: any[]
  set_paid: boolean
}

type WooCommerceOrderListResponse = WooCommerceOrder[]

export function transformIntoOrder(order: WooCommerceOrder): Order {
  return {
    id: order.id.toString(),
    orderNo: order.id,
    storeId: null,
    batchNo: null,
    amount: null,
    parentOrderNo: order.parent_id ? order.parent_id.toString() : null,
    vendorId: '',
    isEmailSentToVendor: false,
    status: order.status,
    cartId: '',
    userId: order.customer_id.toString(),
    userPhone: order.billing.phone,
    userFirstName: order.billing.first_name,
    userLastName: order.billing.last_name,
    userEmail: order.billing.email,
    comment: order.customer_note,
    needAddress: true,
    selfTakeout: false,
    shippingCharges: parseFloat(order.shipping_total),
    total: parseFloat(order.total),
    subtotal: parseFloat(order.total) - parseFloat(order.shipping_total) - parseFloat(order.total_tax),
    discount: parseFloat(order.discount_total),
    tax: parseFloat(order.total_tax),
    currencySymbol: null,
    currencyCode: order.currency,
    codCharges: null,
    codPaid: null,
    paid: order.status === 'completed',
    paySuccess: order.status === 'completed' ? 1 : 0,
    amountRefunded: null,
    amountDue: null,
    amountPaid: parseFloat(order.total),
    totalDiscount: parseFloat(order.discount_total),
    totalAmountRefunded: null,
    paymentMethod: order.payment_method,
    platform: 'woocommerce',
    couponUsed: null,
    coupon: null,
    paymentStatus: order.status,
    paymentCurrency: order.currency,
    paymentMsg: null,
    paymentReferenceId: order.transaction_id,
    paymentGateway: order.payment_method,
    paymentId: order.transaction_id,
    paymentAmount: parseFloat(order.total),
    paymentMode: null,
    paymentDate: order.date_paid,
    shippingAddressId: null,
    billingAddressId: null,
    shippingAddress: {
      firstName: order.shipping.first_name,
      lastName: order.shipping.last_name,
      company: order.shipping.company,
      address1: order.shipping.address_1,
      address2: order.shipping.address_2,
      city: order.shipping.city,
      province: order.shipping.state,
      country: order.shipping.country,
      zip: order.shipping.postcode,
      phone: order.billing.phone
    },
    billingAddress: {
      firstName: order.billing.first_name,
      lastName: order.billing.last_name,
      company: order.billing.company,
      address1: order.billing.address_1,
      address2: order.billing.address_2,
      city: order.billing.city,
      province: order.billing.state,
      country: order.billing.country,
      zip: order.billing.postcode,
      phone: order.billing.phone,
      email: order.billing.email
    },
    createdAt: order.date_created,
    updatedAt: order.date_modified,
    lineItems: order.line_items.map((item: any) => ({
      id: item.id.toString(),
      title: item.name,
      quantity: item.quantity,
      price: item.price,
      total: item.total,
      productId: item.product_id.toString(),
      variantId: item.variation_id?.toString() || item.product_id.toString(),
      thumbnail: '',
      handle: '',
      sku: item.sku,
      description: '',
      images: [],
      variant: {
        id: item.variation_id?.toString() || item.product_id.toString(),
        title: item.name,
        price: item.price,
        sku: item.sku
      }
    }))
  }
}
/**
 * OrderService provides functionality for working with WooCommerce orders
 *
 * This service helps with:
 * - Fetching orders from WooCommerce
 * - Managing order status and details
 * - Handling customer order information
 */
export class OrderService extends BaseService {
  private static instance: OrderService

  /**
   * Get the singleton instance
   */
  /**
 * Get the singleton instance
 * 
 * @returns {OrderService} The singleton instance of OrderService
 */
=======
import { BaseService } from './base-service.js'
import type { Order } from '../types/index.js'

export function transformWooCommerceOrder(wo: any): Order {
  return {
    id: wo.id.toString(),
    orderNo: wo.number,
    createdAt: wo.date_created,
    updatedAt: wo.date_modified,
    status: wo.status,
    lineItems: wo.line_items.map((item: any) => ({
      id: item.id.toString(),
      productId: item.product_id.toString(),
      variantId: item.variant_id.toString(),
      qty: item.quantity,
      price: parseFloat(item.price),
      total: parseFloat(item.total),
      title: item.name,
      sku: item.sku,
    })),
    userEmail: wo.billing.email,
    userPhone: wo.billing.phone,
    userFirstName: wo.billing.first_name,
    userLastName: wo.billing.last_name,
    shippingAddress: wo.shipping,
    billingAddress: wo.billing,
    subtotal: parseFloat(wo.discount_total) + parseFloat(wo.total), // Approx
    total: parseFloat(wo.total),
    discount: parseFloat(wo.discount_total),
    shipping: parseFloat(wo.shipping_total),
    tax: parseFloat(wo.total_tax),
    paymentMethod: wo.payment_method,
    paymentStatus: wo.status,
    currencyCode: wo.currency,
    paid: wo.date_paid !== null
  }
}

export class OrderService extends BaseService {
  private static instance: OrderService

>>>>>>> f348a1b (feat: product listing)
  static getInstance(): OrderService {
    if (!OrderService.instance) {
      OrderService.instance = new OrderService()
    }
    return OrderService.instance
  }
<<<<<<< HEAD
  /**
 * Fetches Order from the API
 * 
 * @param {Object} options - The request options
 * @param {number} [options.page=1] - The page number for pagination
 * @param {string} [options.q=''] - Search query string
 * @param {string} [options.sort='-createdAt'] - Sort order
 * @returns {Promise<any>} The requested data
 * @api {get} /api/order Get order
 * 
 * @example
 * // Example usage
 * const result = await orderService.list({ page: 1 });
 */
  async list({ page = 1, q = '', sort = '-date_created' }): Promise<PaginatedResponse<Order>> {
    const searchParams = new URLSearchParams()
    searchParams.set('page', page.toString())
    searchParams.set('per_page', String(PAGE_SIZE))
    if (q) {
      searchParams.set('search', q)
    }
    searchParams.set('orderby', sort.startsWith('-') ? sort.substring(1) : sort)
    searchParams.set('order', sort.startsWith('-') ? 'desc' : 'asc')

    const orders = await this.get<WooCommerceOrder[]>(`/wp-json/wc/v3/orders?` + searchParams.toString())

    // Get total count from X-WP-Total header if available, otherwise use array length
    return {
      page,
      pageSize: PAGE_SIZE,
      count: orders.length,
      data: orders.map(transformIntoOrder),
      noOfPage: Math.ceil(orders.length / PAGE_SIZE)
    }
  }

  /**
 * Fetches Order from the API
 * 
 * @param {Object} options - The request options
 * @param {number} [options.page=1] - The page number for pagination
 * @param {string} [options.q=''] - Search query string
 * @param {string} [options.sort='-createdAt'] - Sort order
 * @returns {Promise<any>} The requested data
 * @api {get} /api/order Get order
 * 
 * @example
 * // Example usage
 * const result = await orderService.listOrdersByParent({ page: 1 });
 */

  async listOrdersByParent({
    orderNo,
    cartId
  }: {
    orderNo: string | null
    cartId: string | null
  }): Promise<PaginatedResponse<Order>> {
    if (!orderNo) {
      throw new Error('Order number is required')
    }
    
    const res = await this.get<WooCommerceOrder>(`/wp-json/wc/v3/orders/${orderNo}`)
    return {
      pageSize: PAGE_SIZE,
      page: 1,
      count: 1,
      noOfPage: 1,
      data: [transformIntoOrder(res)]
    }
  }

  /**
 * Fetches a single Order by ID
 * 
 * @param {string} id - The ID of the order to fetch
 * @returns {Promise<any>} The requested order
 * @api {get} /api/orders/:id Get order by ID
 * 
 * @example
 * // Example usage
 * const order = await orderService.fetchOrder('123');
 */

  async fetchOrder(id: string) {
    const res = await this.get<WooCommerceOrder>(`/wp-json/wc/v3/orders/${id}`)
    return transformIntoOrder(res)
  }

  /**
 * Fetches a single Order by ID
 * 
 * @param {string} id - The ID of the order to fetch
 * @returns {Promise<any>} The requested order
 * @api {get} /api/orders/:id Get order by ID
 * 
 * @example
 * // Example usage
 * const order = await orderService.getOrder('123');
 */

  async getOrder(orderNo: string) {
    const res = await this.get<WooCommerceOrder>(`/wp-json/wc/v3/orders/${orderNo}`)
    return transformIntoOrder(res)
  }

  /**
 * Fetches a single Order by ID
 * 
 * @param {string} id - The ID of the order to fetch
 * @returns {Promise<any>} The requested order
 * @api {get} /api/orders/:id Get order by ID
 * 
 * @example
 * // Example usage
 * const order = await orderService.fetchTrackOrder('123');
 */

  async fetchTrackOrder(id: string) {
    // WooCommerce doesn't have a built-in endpoint for tracking orders
    // This would typically require a custom endpoint or plugin
    const res = await this.get<WooCommerceOrder>(`/wp-json/wc/v3/orders/${id}`)
    return {
      pageSize: PAGE_SIZE,
      page: 1,
      count: 1,
      noOfPage: 1,
      data: [transformIntoOrder(res)]
    }
  }

  async paySuccessPageHit(orderId: string) {
    const res = await this.get<WooCommerceOrder>(`/wp-json/wc/v3/orders/${orderId}`)
    return transformIntoOrder(res)
  }

  async codCheckout({
    cartId,
    paymentMethod,
    paymentProviderId
  }: {
    cartId: string
    paymentMethod: string
    paymentProviderId: string
  }) {
    // WooCommerce Store API checkout
    cartId = await cartService.ensureCartId(cartId)
    return this.post(`/wp-json/wc/store/v1/cart/checkout`, {
      payment_method: paymentProviderId,
      payment_method_title: paymentMethod
    })
  }

  async cashfreeCheckout({
    cartId,
    paymentMethod
  }: {
    cartId: string
    paymentMethod: string
  }) {
    // WooCommerce Store API checkout - payment method handling varies by gateway
    cartId = await cartService.ensureCartId(cartId)
    return this.post(`/wp-json/wc/store/v1/cart/checkout`, {
      payment_method: 'cashfree',
      payment_method_title: paymentMethod
    })
  }

  async razorpayCheckout({
    cartId,
    paymentMethod
  }: {
    cartId: string
    paymentMethod: string
  }) {
    // WooCommerce Store API checkout - payment method handling varies by gateway
    cartId = await cartService.ensureCartId(cartId)
    return this.post(`/wp-json/wc/store/v1/cart/checkout`, {
      payment_method: 'razorpay',
      payment_method_title: paymentMethod
    })
  }

  async stripeCheckout({ cartId, paymentMethod }: { cartId: string; paymentMethod: string }) {
    // WooCommerce Store API checkout - payment method handling varies by gateway
    cartId = await cartService.ensureCartId(cartId)
    return this.post(`/wp-json/wc/store/v1/cart/checkout`, {
      payment_method: 'stripe',
      payment_method_title: paymentMethod
    })
  }

  async razorCapture({ rpPaymentId, rpOrderId }: { rpPaymentId: string; rpOrderId: string }) {
    // WooCommerce payment capture typically handled by payment gateway
    // This would require custom implementation based on the gateway used
    throw new Error('Payment capture should be handled by the payment gateway')
  }

  /**
 * Fetches Order from the API
 * 
 * @param {Object} options - The request options
 * @param {number} [options.page=1] - The page number for pagination
 * @param {string} [options.q=''] - Search query string
 * @param {string} [options.sort='-createdAt'] - Sort order
 * @returns {Promise<any>} The requested data
 * @api {get} /api/order Get order
 * 
 * @example
 * // Example usage
 * const result = await orderService.listPublic({ page: 1 });
 */

  async listPublic() {
    // WooCommerce doesn't have a public order list endpoint
    // Orders are customer-specific
    throw new Error('Public order list not available in WooCommerce REST API')
  }

  /**
 * Fetches a single Order by ID
 * 
 * @param {string} id - The ID of the order to fetch
 * @returns {Promise<any>} The requested order
 * @api {get} /api/orders/:id Get order by ID
 * 
 * @example
 * // Example usage
 * const order = await orderService.getOrderByEmailAndOTP('123');
 */

  async getOrderByEmailAndOTP({ email, otp }: { email: string; otp: string }) {
    // WooCommerce doesn't have a built-in endpoint for this
    // This would require a custom endpoint
    throw new Error('Order lookup by email and OTP requires custom endpoint')
  }

  async buyAgain() {
    // WooCommerce doesn't have a built-in buy again feature
    // This would need to be implemented using product/cart endpoints
    throw new Error('Buy again feature requires custom implementation')
  }

  async submitReview({ rating, review, productId, variantId, uploadedImages }: any) {
    // WooCommerce Product Reviews endpoint
    return this.post<any>(`/wp-json/wc/v3/products/${productId}/reviews`, {
      review,
      rating,
      reviewer: 'Customer',
      reviewer_email: '',
      uploaded_images: uploadedImages
    })
  }
}

// Use singleton instance
export const orderService = OrderService.getInstance()

=======

  async list({ page = 1, perPage = 20 } = {}) {
    const res = await this.get<any[]>('/wp-json/wc/v3/orders', { page, per_page: perPage })
    return {
      data: res.map(transformWooCommerceOrder),
      count: res.length,
      page,
      pageSize: perPage,
      noOfPage: 1
    }
  }

  async getOne(id: string) {
    const res = await this.get<any>(`/wp-json/wc/v3/orders/${id}`)
    return transformWooCommerceOrder(res)
  }

  async create(data: any) {
    const res = await this.post<any>('/wp-json/wc/v3/orders', data)
    return transformWooCommerceOrder(res)
  }
}

export const orderService = OrderService.getInstance()
>>>>>>> f348a1b (feat: product listing)
