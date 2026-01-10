import { BaseService } from './base-service'

/**
 * CheckoutService provides functionality for checkout operations in WooCommerce.
 * 
 * WooCommerce handles checkout through creating orders and processing payments.
 * The checkout flow typically involves:
 * 1. Create a cart (via Store API or WC Cart API)
 * 2. Create an order with customer and billing info
 * 3. Process payment through payment gateway
 * 
 * Note: Some WooCommerce installations may require additional plugins
 * for full checkout functionality (e.g., for digital products, subscriptions, etc.)
 */

type WooCommerceOrder = {
  id: number
  status: string
  currency: string
  total: string
  billing: {
    first_name: string
    last_name: string
    email: string
    phone: string
    address_1: string
    address_2: string
    city: string
    state: string
    postcode: string
    country: string
  }
  shipping: {
    first_name: string
    last_name: string
    address_1: string
    address_2: string
    city: string
    state: string
    postcode: string
    country: string
  }
  line_items: Array<{
    product_id: number
    quantity: number
    total: string
  }>
  payment_method: string
  payment_method_title: string
  transaction_id: string
  date_created: string
}

type WooCommerceOrderStatus = 'pending' | 'processing' | 'on-hold' | 'completed' | 'cancelled' | 'refunded' | 'failed'

export interface CheckoutCustomerInfo {
  email: string
  firstName: string
  lastName: string
  phone?: string
  billingAddress: {
    address1: string
    address2?: string
    city: string
    state: string
    postcode: string
    country: string
  }
  shippingAddress?: {
    address1: string
    address2?: string
    city: string
    state: string
    postcode: string
    country: string
  }
  shipToDifferentAddress?: boolean
}

export interface CartItem {
  id: string
  productId: number
  quantity: number
}

export interface PaymentInfo {
  paymentMethod: string
  paymentNonce?: string
  isTestMode?: boolean
}

export interface CheckoutResult {
  orderId: number
  status: string
  paymentUrl?: string
  paymentMethod?: string
}

export class CheckoutService extends BaseService {
  private static instance: CheckoutService

  /**
   * Get the singleton instance
   */
  static getInstance(): CheckoutService {
    if (!CheckoutService.instance) {
      CheckoutService.instance = new CheckoutService()
    }
    return CheckoutService.instance
  }

  /**
   * Process checkout by creating an order and optionally processing payment
   * 
   * @param {Object} checkoutData - The checkout data
   * @param {CheckoutCustomerInfo} checkoutData.customer - Customer information
   * @param {CartItem[]} checkoutData.items - Cart items
   * @param {PaymentInfo} [checkoutData.payment] - Payment information (optional)
   * @param {string} [checkoutData.couponCode] - Coupon code to apply
   * @returns {Promise<CheckoutResult>} The checkout result
   * 
   * @example
   * // Example usage
   * const result = await checkoutService.process({
   *   customer: {
   *     email: 'customer@example.com',
   *     firstName: 'John',
   *     lastName: 'Doe',
   *     billingAddress: { ... }
   *   },
   *   items: [{ productId: 123, quantity: 2 }],
   *   payment: { paymentMethod: 'bacs' }
   * });
   */
  async process({
    customer,
    items,
    payment,
    couponCode,
  }: {
    customer: CheckoutCustomerInfo
    items: CartItem[]
    payment?: PaymentInfo
    couponCode?: string
  }): Promise<CheckoutResult> {
    // Build line items from cart items
    const line_items = items.map(item => ({
      product_id: item.productId,
      quantity: item.quantity,
    }))

    // Build the order payload
    const orderData: any = {
      payment_method: payment?.paymentMethod || 'bacs',
      payment_method_title: payment?.paymentMethod || 'Direct Bank Transfer',
      set_paid: payment !== undefined,
      billing: {
        first_name: customer.firstName,
        last_name: customer.lastName,
        email: customer.email,
        phone: customer.phone || '',
        address_1: customer.billingAddress.address1,
        address_2: customer.billingAddress.address2 || '',
        city: customer.billingAddress.city,
        state: customer.billingAddress.state,
        postcode: customer.billingAddress.postcode,
        country: customer.billingAddress.country,
      },
      shipping: {
        first_name: customer.firstName,
        last_name: customer.lastName,
        address_1: customer.shippingAddress?.address1 || customer.billingAddress.address1,
        address_2: customer.shippingAddress?.address2 || customer.billingAddress.address2 || '',
        city: customer.shippingAddress?.city || customer.billingAddress.city,
        state: customer.shippingAddress?.state || customer.billingAddress.state,
        postcode: customer.shippingAddress?.postcode || customer.billingAddress.postcode,
        country: customer.shippingAddress?.country || customer.billingAddress.country,
      },
      line_items,
    }

    // Add coupon if provided
    if (couponCode) {
      orderData.coupon_lines = [{ code: couponCode }]
    }

    // Create the order
    const order = await this.post<WooCommerceOrder>('/wp-json/wc/v3/orders', orderData)

    // Process payment if payment info provided and order not already paid
    if (payment && !order.set_paid) {
      // For most payment gateways, you'll need to redirect to the payment page
      // or use a payment plugin's API. This is a simplified version.
      return {
        orderId: order.id,
        status: order.status,
        paymentUrl: order.payment_method !== 'bacs' ? undefined : this.getPaymentInstructions(order),
        paymentMethod: order.payment_method_title,
      }
    }

    return {
      orderId: order.id,
      status: order.status,
      paymentMethod: order.payment_method_title,
    }
  }

  /**
   * Generate payment instructions for bank transfer payments
   */
  private getPaymentInstructions(order: WooCommerceOrder): string {
    return `Order #${order.id} - Total: ${order.currency} ${order.total}. Please transfer to the bank account specified in your confirmation email.`
  }

  /**
   * Validate checkout data before processing
   * 
   * @param {Object} checkoutData - The checkout data to validate
   * @returns {Promise<{valid: boolean, errors: string[]}>} Validation result
   */
  async validate({
    customer,
    items,
  }: {
    customer: CheckoutCustomerInfo
    items: CartItem[]
  }): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = []

    // Validate customer info
    if (!customer.email) {
      errors.push('Email is required')
    }
    if (!customer.firstName) {
      errors.push('First name is required')
    }
    if (!customer.lastName) {
      errors.push('Last name is required')
    }
    if (!customer.billingAddress.address1) {
      errors.push('Billing address is required')
    }
    if (!customer.billingAddress.city) {
      errors.push('City is required')
    }
    if (!customer.billingAddress.country) {
      errors.push('Country is required')
    }

    // Validate items
    if (!items || items.length === 0) {
      errors.push('Cart is empty')
    }

    // If shipping to different address, validate shipping address
    if (customer.shipToDifferentAddress) {
      if (!customer.shippingAddress?.address1) {
        errors.push('Shipping address is required')
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * Calculate totals for checkout without creating order
   * 
   * @param {CartItem[]} items - Cart items
   * @param {string} [couponCode] - Coupon code to apply
   * @param {CheckoutCustomerInfo} [customer] - Customer info for tax calculation
   * @returns {Promise<{subtotal: number, total: number, taxes: number}>} Calculated totals
   */
  async calculateTotals(
    items: CartItem[],
    couponCode?: string,
    customer?: CheckoutCustomerInfo
  ): Promise<{ subtotal: number; total: number; taxes: number }> {
    // Note: WooCommerce doesn't have a direct calculate totals endpoint.
    // The typical approach is to create a temporary order or use the Store API cart.
    // This is a placeholder that requires the Store API or a custom implementation.
    
    // For accurate totals, you would typically:
    // 1. Use the Store API /wc/store/v1/cart to manage cart
    // 2. Calculate totals from the cart response
    
    // For now, return placeholder values
    // In production, implement using Store API or custom endpoint
    return {
      subtotal: 0,
      total: 0,
      taxes: 0,
    }
  }

  /**
   * Get available payment gateways for checkout
   * 
   * @returns {Promise<Array<{id: string, title: string, description: string}>>} Available payment methods
   */
  async getPaymentGateways(): Promise<Array<{ id: string; title: string; description: string }>> {
    // This would typically call the payment method service
    // Import dynamically to avoid circular dependency
    const { paymentMethodService } = await import('./payment-method-service')
    const { data } = await paymentMethodService.list()
    return data.map(m => ({
      id: m.id,
      title: m.name,
      description: m.description,
    }))
  }

  /**
   * Generate checkout URL for order
   * 
   * @param {number} orderId - The order ID
   * @returns {string} The checkout/payment URL
   */
  getCheckoutUrl(orderId: number): string {
    // Return the WooCommerce checkout URL for the order
    // This typically requires the store URL to be configured
    const storeUrl = this.getStoreUrl()
    return `${storeUrl}/checkout/order-pay/${orderId}/`
  }

  /**
   * Get the store URL from configuration or return empty string
   */
  private getStoreUrl(): string {
    // This should be configured externally or obtained from config
    return ''
  }
}

// Use singleton instance
export const checkoutService = CheckoutService.getInstance()
