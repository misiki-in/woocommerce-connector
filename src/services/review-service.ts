import type { PaginatedResponse } from '../types'
import { BaseService } from './base.service'
import { PRODUCT_PAGE_SIZE, WOO_MAX_PER_PAGE } from './product-service'

/**
 * ReviewService — WooCommerce. Signatures mirror @misiki/litekart-connector.
 *
 *   GET  /products/reviews   https://woocommerce.github.io/woocommerce-rest-api-docs/#list-all-product-reviews
 *   POST /products/reviews   https://woocommerce.github.io/woocommerce-rest-api-docs/#create-a-product-review
 *
 * Two things to know:
 *  - `product` is the filter param on v3 (the Store API calls it `product_id`), and it is
 *    an ARRAY param: one value works, several need product[]=1&product[]=2.
 *  - `status` defaults to `approved`, so pending reviews are invisible unless a read-scoped
 *    key asks for status=all.
 * Review submission must go through v3: the Store API is read-only for reviews.
 */

/**
 * A WooCommerce review in litekart's Feedback shape (a superset: productId/reviewer/
 * reviewerEmail/verified/avatar are additive). The v3 review payload is
 * id/date_created/product_id/status/reviewer/reviewer_email/review/rating/verified/
 * reviewer_avatar_urls — there is no WP user id, no merchant reply and no modified date, so
 * `userId` is '' (litekart types it `string`, so it must not be null), `response` is null and
 * `updatedAt` repeats the creation date rather than inventing values.
 */
export type Feedback = {
  id: string
  productId: string
  userId: string
  reviewer: string
  reviewerEmail: string
  content: string
  rating: number
  isActive: boolean
  verified: boolean
  response: string | null
  avatar: string | null
  feedbackDate: string
  createdAt: string
  updatedAt: string
}

/** Map a v3 product review into the Feedback shape above. */
export function mapWooReview(raw: any): Feedback {
  const created = String(raw?.date_created ?? raw?.date_created_gmt ?? '')
  const avatars = raw?.reviewer_avatar_urls || {}
  return {
    id: String(raw?.id ?? ''),
    productId: raw?.product_id != null ? String(raw.product_id) : '',
    userId: '',
    reviewer: String(raw?.reviewer ?? ''),
    reviewerEmail: String(raw?.reviewer_email ?? ''),
    content: String(raw?.review ?? ''),
    rating: Number(raw?.rating ?? 0) || 0,
    isActive: raw?.status ? raw.status === 'approved' : true,
    verified: !!raw?.verified,
    response: null,
    avatar: avatars['96'] || avatars['48'] || avatars['24'] || null,
    feedbackDate: created,
    createdAt: created,
    updatedAt: created
  }
}

/**
 * litekart's `-field` token -> WooCommerce review orderby/order pair.
 * The orderby enum is date, date_gmt, id, slug, include, product (default date_gmt) —
 * there is NO orderby=rating, so sorting by stars has to happen client-side.
 */
function wooReviewSort(sort?: string): { orderby: string; order: 'asc' | 'desc' } {
  const raw = (sort || '').trim()
  const order: 'asc' | 'desc' = raw.startsWith('-') ? 'desc' : 'asc'
  const map: Record<string, string> = { createdAt: 'date_gmt', created_at: 'date_gmt', date: 'date', id: 'id', slug: 'slug', product: 'product', productId: 'product' }
  const orderby = map[raw.replace(/^-/, '')]
  return orderby ? { orderby, order } : { orderby: 'date_gmt', order: 'desc' }
}

/** ReviewService — WooCommerce. Signatures mirror @misiki/litekart-connector. */
export class ReviewService extends BaseService {
  private static instance: ReviewService
  static getInstance(): ReviewService { if (!ReviewService.instance) ReviewService.instance = new ReviewService(); return ReviewService.instance }

  /** Shared GET /products/reviews call with real totals from X-WP-Total(-Pages). */
  protected async queryReviews(params: Record<string, unknown>, page: number, perPage: number): Promise<PaginatedResponse<Feedback>> {
    const res = await this.getPaged<any>('/products/reviews' + this.qs({ page, per_page: perPage, ...params }))
    return { data: res.data.map(mapWooReview), count: res.total, pageSize: perPage, noOfPage: res.totalPages, page }
  }

  /** GET /products/reviews?product={id}&search=&orderby=&order=&status=approved */
  async fetchReviews({ productId, search = '', sort = '-createdAt', currentPage = 1 }: { productId: string; search?: string; sort?: string; currentPage?: number }): Promise<PaginatedResponse<Feedback>> {
    const { orderby, order } = wooReviewSort(sort)
    return this.queryReviews({ product: productId, search, orderby, order, status: 'approved' }, currentPage, PRODUCT_PAGE_SIZE)
  }

  /** Same endpoint, no `product` filter — every approved review in the store. */
  async allReviews({ search = '', sort = '-createdAt', currentPage = 1 }: { search?: string; sort?: string; currentPage?: number } = {}): Promise<PaginatedResponse<Feedback>> {
    const { orderby, order } = wooReviewSort(sort)
    return this.queryReviews({ search, orderby, order, status: 'approved' }, currentPage, PRODUCT_PAGE_SIZE)
  }

  /** Every approved review for one product in a single call (per_page=100, the WooCommerce maximum). */
  async fetchProducrReviews(productId: string): Promise<PaginatedResponse<Feedback>> {
    return this.queryReviews({ product: productId, status: 'approved' }, 1, WOO_MAX_PER_PAGE)
  }

  /**
   * POST /products/reviews. WooCommerce requires product_id, reviewer, reviewer_email and
   * review; `rating` (0-5) and `status` are optional. Fields litekart's Feedback carries
   * that WooCommerce has no column for (userId, response) are not sent.
   */
  async saveReview(review: Partial<Omit<Feedback, 'id'>> & { productId: string; content: string }): Promise<Feedback> {
    const raw = await this.post<any>('/products/reviews', {
      product_id: Number(review.productId),
      review: review.content,
      reviewer: review.reviewer,
      reviewer_email: review.reviewerEmail,
      rating: review.rating
    })
    return mapWooReview(raw)
  }
}
export const reviewService = ReviewService.getInstance()
