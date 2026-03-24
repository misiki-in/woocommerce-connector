<<<<<<< HEAD
import { BaseService } from './base-service'

/**
 * PaymentMethodService provides functionality for working with payment methods
 * in WooCommerce.
 * 
 * WooCommerce uses payment gateways configured in the WordPress admin.
 * This service retrieves available payment gateways through the WC REST API.
 */

type WooCommercePaymentGateway = {
  id: string
  title: string
  description: string
  enabled: boolean
  method_title: string
  method_description: string
  settings?: Record<string, any>
}

export type PaymentMethod = {
  id: string
  name: string
  description: string
  enabled: boolean
  icon?: string
}

function transformToPaymentMethod(gateway: WooCommercePaymentGateway): PaymentMethod {
  return {
    id: gateway.id,
    name: gateway.title,
    description: gateway.description,
    enabled: gateway.enabled,
  }
}

export class PaymentMethodService extends BaseService {
  private static instance: PaymentMethodService

  /**
   * Get the singleton instance
   */
=======
import { BaseService } from './base-service.js'

/**
 * PaymentMethodService provides functionality for managing payment gateways.
 */
export class PaymentMethodService extends BaseService {
  private static instance: PaymentMethodService

>>>>>>> f348a1b (feat: product listing)
  static getInstance(): PaymentMethodService {
    if (!PaymentMethodService.instance) {
      PaymentMethodService.instance = new PaymentMethodService()
    }
    return PaymentMethodService.instance
  }

  /**
<<<<<<< HEAD
   * Fetches payment methods (gateways) from WooCommerce
   * Uses WooCommerce REST API /wp-json/wc/v3/payment_gateways
   * 
   * @param {Object} options - The request options
   * @param {number} [options.page=1] - The page number for pagination
   * @param {string} [options.q=''] - Search query string (filters by title)
   * @returns {Promise<{data: PaymentMethod[], count: number}>} The payment methods
   * @api {get} /wp-json/wc/v3/payment_gateways Get payment gateways
   * 
   * @example
   * // Example usage
   * const methods = await paymentMethodService.list({ page: 1 });
   */
  async list({ page = 1, q = '' }: { page?: number; q?: string } = {}) {
    // Get all payment gateways from WooCommerce
    const gateways = await this.get<WooCommercePaymentGateway[]>('/wp-json/wc/v3/payment_gateways')
    
    // Filter by search query if provided
    let filteredGateways = gateways
    if (q) {
      filteredGateways = gateways.filter(g => 
        g.title.toLowerCase().includes(q.toLowerCase()) ||
        g.description.toLowerCase().includes(q.toLowerCase())
      )
    }

    return {
      data: filteredGateways.map(transformToPaymentMethod),
      count: filteredGateways.length,
      page,
      pageSize: filteredGateways.length,
    }
  }

  /**
   * Get a specific payment method by ID
   * 
   * @param {string} id - The payment gateway ID
   * @returns {Promise<PaymentMethod | null>} The payment method or null if not found
   */
  async getById(id: string): Promise<PaymentMethod | null> {
    try {
      const gateway = await this.get<WooCommercePaymentGateway>(`/wp-json/wc/v3/payment_gateways/${id}`)
      return transformToPaymentMethod(gateway)
    } catch (error) {
      return null
    }
  }

  /**
   * Get all enabled payment methods
   * 
   * @returns {Promise<PaymentMethod[]>} List of enabled payment methods
   */
  async getEnabled(): Promise<PaymentMethod[]> {
    const gateways = await this.get<WooCommercePaymentGateway[]>('/wp-json/wc/v3/payment_gateways')
    return gateways
      .filter(g => g.enabled)
      .map(transformToPaymentMethod)
  }
}

// Use singleton instance
=======
   * List all enabled payment gateways
   */
  async list() {
    try {
      const res = await this.get<any[]>('/wp-json/wc/v3/payment_gateways')
      return res.filter((pg: any) => pg.enabled).map((pg: any) => ({
        id: pg.id,
        title: pg.title,
        description: pg.description,
        method_title: pg.method_title,
        method_description: pg.method_description,
      }))
    } catch (error) {
      console.error('Error fetching payment methods:', error)
      return []
    }
  }
}

>>>>>>> f348a1b (feat: product listing)
export const paymentMethodService = PaymentMethodService.getInstance()
