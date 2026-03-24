<<<<<<< HEAD
import type { Coupon, PaginatedResponse } from './../types'
import { BaseService } from './base-service'
import { PAGE_SIZE } from '../config'

type WooCommerceCoupon = {
  id: number
  code: string
  amount: string
  status: string
  date_created: string
  date_created_gmt: string
  date_modified: string
  date_modified_gmt: string
  discount_type: string
  description: string
  date_expires: string
  date_expires_gmt: string
  usage_count: number
  individual_use: boolean
  product_ids: number[]
  excluded_product_ids: number[]
  usage_limit: number
  usage_limit_per_user: number
  limit_usage_to_x_items: number
  free_shipping: boolean
  product_categories: number[]
  excluded_product_categories: number[]
  exclude_sale_items: boolean
  minimum_amount: string
  maximum_amount: string
  email_restrictions: string[]
  meta_data: any[]
}

function transformCoupon(coupon: WooCommerceCoupon): Coupon {
  return {
    id: coupon.id.toString(),
    code: coupon.code,
    value: parseFloat(coupon.amount) || 0,
    type: coupon.discount_type || 'fixed_cart',
    minCartValue: parseFloat(coupon.minimum_amount) || 0,
    maxCartValue: parseFloat(coupon.maximum_amount) || 0,
    usageLimit: coupon.usage_limit,
    used: coupon.usage_count,
    active: coupon.status === 'active',
    description: coupon.description,
    createdAt: coupon.date_created,
    updatedAt: coupon.date_modified,
    expiresAt: coupon.date_expires,
    productIds: coupon.product_ids?.map(id => id.toString()) || [],
    excludedProductIds: coupon.excluded_product_ids?.map(id => id.toString()) || [],
    categories: coupon.product_categories?.map(id => id.toString()) || [],
    excludedCategories: coupon.excluded_product_categories?.map(id => id.toString()) || [],
    freeShipping: coupon.free_shipping,
    individualUse: coupon.individual_use,
    excludeSaleItems: coupon.exclude_sale_items
  }
}

/**
 * CouponService provides functionality for working with WooCommerce coupons
 *
 * This service helps with:
 * - Fetching coupons from WooCommerce
 * - Creating, updating, and deleting coupons
 * - Validating and applying coupons
 */
export class CouponService extends BaseService {
  private static instance: CouponService

  /**
   * Get the singleton instance
   *
   * @returns {CouponService} The singleton instance of CouponService
   */
=======
import { BaseService } from './base-service.js'

export class CouponService extends BaseService {
  private static instance: CouponService

>>>>>>> f348a1b (feat: product listing)
  static getInstance(): CouponService {
    if (!CouponService.instance) {
      CouponService.instance = new CouponService()
    }
    return CouponService.instance
  }

<<<<<<< HEAD
  /**
   * Fetches coupons from the WooCommerce API
   *
   * @param {Object} options - The request options
   * @param {number} [options.page=1] - The page number for pagination
   * @param {string} [options.q=''] - Search query string
   * @param {string} [options.sort='-createdAt'] - Sort order
   * @returns {Promise<PaginatedResponse<Coupon>>} Paginated list of coupons
   * @api {get} /wp-json/wc/v3/coupons List coupons
   *
   * @example
   * // Example usage
   * const result = await couponService.list({ page: 1 });
   */
  async list({ page = 1, q = '', sort = '-date_created' }): Promise<PaginatedResponse<Coupon>> {
    const searchParams = new URLSearchParams()
    searchParams.set('page', page.toString())
    searchParams.set('per_page', String(PAGE_SIZE))
    if (q) {
      searchParams.set('search', q)
    }
    searchParams.set('orderby', sort.startsWith('-') ? sort.substring(1) : sort)
    searchParams.set('order', sort.startsWith('-') ? 'desc' : 'asc')

    const coupons = await this.get<WooCommerceCoupon[]>(`/wp-json/wc/v3/coupons?` + searchParams.toString())

    return {
      page,
      pageSize: PAGE_SIZE,
      count: coupons.length,
      data: coupons.map(transformCoupon),
      noOfPage: Math.ceil(coupons.length / PAGE_SIZE)
    }
  }

  /**
   * Search for coupons
   *
   * @param {Object} options - The request options
   * @param {number} [options.page=1] - The page number for pagination
   * @param {string} [options.q=''] - Search query string
   * @param {string} [options.sort='-createdAt'] - Sort order
   * @returns {Promise<PaginatedResponse<Coupon>>} Paginated list of coupons
   */
  async searchCoupons({ page = 1, q = '', sort = '-date_created' }): Promise<PaginatedResponse<Coupon>> {
    return this.list({ page, q, sort })
  }

  /**
   * Fetches a single coupon by ID
   *
   * @param {string} id - The ID of the coupon to fetch
   * @returns {Promise<Coupon>} The requested coupon
   * @api {get} /wp-json/wc/v3/coupons/:id Get coupon by ID
   *
   * @example
   * // Example usage
   * const coupon = await couponService.getCoupon('123');
   */
  async getCoupon(id: string): Promise<Coupon> {
    const coupon = await this.get<WooCommerceCoupon>(`/wp-json/wc/v3/coupons/${id}`)
    return transformCoupon(coupon)
  }

  /**
   * Get a coupon by code
   *
   * @param {string} code - The coupon code
   * @returns {Promise<Coupon | null>} The coupon or null if not found
   */
  async getCouponByCode(code: string): Promise<Coupon | null> {
    const coupons = await this.get<WooCommerceCoupon[]>(`/wp-json/wc/v3/coupons?code=${code}`)
    if (coupons.length === 0) return null
    return transformCoupon(coupons[0])
  }

  /**
   * Creates a new coupon
   *
   * @param {Object} data - The coupon data to create
   * @returns {Promise<Coupon>} The created coupon
   * @api {post} /wp-json/wc/v3/coupons Create coupon
   *
   * @example
   * // Example usage
   * const newCoupon = await couponService.createCoupon({
   *   code: 'SUMMER20',
   *   amount: '20',
   *   discount_type: 'percent',
   *   description: 'Summer sale 20% off'
   * });
   */
  async createCoupon(data: {
    code: string
    amount: string
    discount_type?: string
    description?: string
    minimum_amount?: string
    maximum_amount?: string
    usage_limit?: number
    free_shipping?: boolean
    individual_use?: boolean
    product_ids?: number[]
    product_categories?: number[]
    exclude_sale_items?: boolean
  }): Promise<Coupon> {
    const coupon = await this.post<WooCommerceCoupon>('/wp-json/wc/v3/coupons', data)
    return transformCoupon(coupon)
  }

  /**
   * Updates an existing coupon
   *
   * @param {string} id - The ID of the coupon to update
   * @param {Object} data - The coupon data to update
   * @returns {Promise<Coupon>} The updated coupon
   * @api {put} /wp-json/wc/v3/coupons/:id Update coupon
   */
  async patchCoupon(id: string, data: Partial<{
    code: string
    amount: string
    discount_type: string
    description: string
    minimum_amount: string
    maximum_amount: string
    usage_limit: number
    free_shipping: boolean
    individual_use: boolean
    product_ids: number[]
    product_categories: number[]
    exclude_sale_items: boolean
    status: string
  }>): Promise<Coupon> {
    const coupon = await this.put<WooCommerceCoupon>(`/wp-json/wc/v3/coupons/${id}`, data)
    return transformCoupon(coupon)
  }

  /**
   * Deletes a coupon
   *
   * @param {string} id - The ID of the coupon to delete
   * @param {boolean} [force=false] - Whether to force delete (bypass trash)
   * @returns {Promise<{ deleted: boolean }>} The deletion result
   * @api {delete} /wp-json/wc/v3/coupons/:id Delete coupon
   */
  async deleteCoupon(id: string, force: boolean = false): Promise<{ deleted: boolean }> {
    const result = await this.delete<{ deleted: boolean }>(`/wp-json/wc/v3/coupons/${id}?force=${force}`)
    return result
  }

  /**
   * Validate a coupon code
   *
   * @param {string} code - The coupon code to validate
   * @param {Object} options - Additional validation options
   * @returns {Promise<{ valid: boolean; message?: string }>} Validation result
   */
  async validateCoupon(code: string, options?: {
    product_ids?: number[]
    product_categories?: number[]
    coupon_amount?: number
  }): Promise<{ valid: boolean; message?: string; coupon?: Coupon }> {
    try {
      const coupon = await this.getCouponByCode(code)
      if (!coupon) {
        return { valid: false, message: 'Coupon not found' }
      }
      if (!coupon.active) {
        return { valid: false, message: 'Coupon is not active' }
      }
      return { valid: true, coupon }
    } catch (error) {
      return { valid: false, message: 'Failed to validate coupon' }
    }
  }
}

// Use singleton instance
=======
  async list() {
    return this.get<any[]>('/wp-json/wc/v3/coupons')
  }

  async getByCode(code: string) {
    const res = await this.get<any[]>('/wp-json/wc/v3/coupons', { code })
    return res[0] || null
  }
}

>>>>>>> f348a1b (feat: product listing)
export const couponService = CouponService.getInstance()
