import type { PaginatedResponse } from '../types'
import { WooBaseService } from './cart-service'

/**
 * CouponService — WooCommerce. Signatures mirror @misiki/litekart-connector.
 *
 * Admin CRUD over v3 /coupons:
 * https://woocommerce.github.io/woocommerce-rest-api-docs/#coupons
 *
 * NOTE: v3 /coupons is the ADMIN surface — it does not validate usage limits, minimum
 * spend or product restrictions against a shopper's cart. Redeeming a coupon on the
 * storefront is Store API POST /cart/apply-coupon (see cartService.applyCoupon).
 */

/** litekart's Coupon shape, with the WooCommerce-native fields that have no litekart home appended. */
export type Coupon = {
  id: string
  code: string
  amount: number
  /**
   * WooCommerce discount_type: 'percent' | 'fixed_cart' | 'fixed_product'.
   * litekart's USER/TOTAL/BOGO taxonomy has no WooCommerce equivalent, so the native
   * value is passed through rather than forced into it.
   */
  type: string
  maxAmount: number
  createdAt: string
  updatedAt: string
  description: string | null
  minimumAmount: number
  freeShipping: boolean
  usageLimit: number | null
  usageCount: number
  expiryDate: string | null
}

const PER_PAGE = 20

const num = (v: unknown): number => {
  const n = typeof v === 'string' ? parseFloat(v) : (v as number)
  return Number.isFinite(n) ? n : 0
}

/**
 * litekart sorts with a single '-field' string; WooCommerce always uses the pair
 * orderby + order. The coupon code IS the post title, so 'code' maps to orderby=title.
 *
 * The /coupons orderby enum is EXACTLY date | id | include | title | slug — WooCommerce
 * narrows WordPress core's list, so `orderby=modified` is rejected with 400
 * rest_invalid_param and `updatedAt` degrades to `date` instead of failing the call.
 * https://woocommerce.github.io/woocommerce-rest-api-docs/#list-all-coupons
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
    code: 'title',
    title: 'title',
    slug: 'slug'
  }
  const orderby = map[field] || 'date'
  return { orderby: ORDERBY_ENUM.has(orderby) ? orderby : 'date', order }
}

export function mapCoupon(raw: any): Coupon {
  return {
    id: String(raw?.id ?? ''),
    code: String(raw?.code ?? ''),
    amount: num(raw?.amount),
    type: String(raw?.discount_type ?? ''),
    maxAmount: num(raw?.maximum_amount),
    createdAt: raw?.date_created ?? raw?.date_created_gmt ?? '',
    updatedAt: raw?.date_modified ?? raw?.date_modified_gmt ?? '',
    description: raw?.description || null,
    minimumAmount: num(raw?.minimum_amount),
    freeShipping: Boolean(raw?.free_shipping),
    usageLimit: raw?.usage_limit ?? null,
    usageCount: num(raw?.usage_count),
    expiryDate: raw?.date_expires ?? null
  }
}

/** Translate a litekart-shaped coupon into a WooCommerce coupon body. */
function toWooCoupon(input: Record<string, any>): Record<string, unknown> {
  const body: Record<string, unknown> = {}
  if (input.code !== undefined) body.code = input.code
  // WooCommerce wants `amount` as a numeric STRING, even for percentage coupons.
  if (input.amount !== undefined) body.amount = String(input.amount)
  if (input.type !== undefined) body.discount_type = input.type
  if (input.discount_type !== undefined) body.discount_type = input.discount_type
  if (input.maxAmount !== undefined) body.maximum_amount = String(input.maxAmount)
  if (input.minimumAmount !== undefined) body.minimum_amount = String(input.minimumAmount)
  if (input.description !== undefined) body.description = input.description
  if (input.freeShipping !== undefined) body.free_shipping = Boolean(input.freeShipping)
  if (input.usageLimit !== undefined) body.usage_limit = input.usageLimit
  if (input.expiryDate !== undefined) body.date_expires = input.expiryDate
  // Pass through any WooCommerce-native keys the caller already speaks.
  for (const k of [
    'individual_use',
    'product_ids',
    'excluded_product_ids',
    'usage_limit_per_user',
    'limit_usage_to_x_items',
    'product_categories',
    'excluded_product_categories',
    'exclude_sale_items',
    'email_restrictions',
    'minimum_amount',
    'maximum_amount',
    'free_shipping',
    'usage_limit',
    'date_expires',
    'meta_data'
  ]) {
    if (input[k] !== undefined) body[k] = input[k]
  }
  return body
}

export class CouponService extends WooBaseService {
  private static instance: CouponService
  static getInstance(): CouponService {
    if (!CouponService.instance) CouponService.instance = new CouponService()
    return CouponService.instance
  }

  /** GET /coupons — per_page must be sent explicitly, WooCommerce defaults it to 10. */
  async listCoupons({ page = 1, q = '', sort = '-createdAt' } = {}): Promise<PaginatedResponse<Coupon>> {
    const { orderby, order } = toOrderBy(sort)
    const { data, total, totalPages } = await this.getPaged<any>(
      '/coupons' + this.qs({ page, per_page: PER_PAGE, search: q, orderby, order })
    )
    return { data: data.map(mapCoupon), count: total, pageSize: PER_PAGE, noOfPage: totalPages, page }
  }

  /**
   * Same endpoint with search=q. If `q` looks like a full coupon code the dedicated
   * `code` filter is used instead — `search` is a fuzzy post-title match and can return
   * the wrong coupon. WooCommerce always lowercases coupon codes.
   */
  async searchCoupons({ page = 1, q = '', sort = '-createdAt' } = {}): Promise<PaginatedResponse<Coupon>> {
    const { orderby, order } = toOrderBy(sort)
    const exact = q && !/\s/.test(q) ? q.toLowerCase() : ''
    const { data, total, totalPages } = await this.getPaged<any>(
      '/coupons' +
        this.qs({ page, per_page: PER_PAGE, code: exact, search: exact ? '' : q, orderby, order })
    )
    return { data: data.map(mapCoupon), count: total, pageSize: PER_PAGE, noOfPage: totalPages, page }
  }

  /** GET /coupons/{id} — numeric post id. There is no /coupons/{code} path. */
  async getCoupon(id: string): Promise<Coupon> {
    return mapCoupon(await this.get<any>(`/coupons/${id}`))
  }

  /** POST /coupons — `code` is required; `amount` must be a numeric string. */
  async createCoupon(coupons: Record<string, any>): Promise<Coupon> {
    return mapCoupon(await this.post<any>('/coupons', toWooCoupon(coupons || {})))
  }

  /** PUT /coupons/{id} — the documented update verb; partial bodies are fine. */
  async patchCoupon(id: string, coupons: Record<string, any>): Promise<Coupon> {
    return mapCoupon(await this.put<any>(`/coupons/${id}`, toWooCoupon(coupons || {})))
  }

  /**
   * DELETE /coupons/{id}?force=true — without `force` the coupon only goes to the WP
   * trash and keeps occupying its code. BaseService.delete() takes no body, so the flag
   * has to ride in the query string.
   */
  async deleteCoupon(id: string): Promise<Coupon> {
    return mapCoupon(await this.delete<any>(`/coupons/${id}` + this.qs({ force: true })))
  }
}

// // Use singleton instance
export const couponService = CouponService.getInstance()
