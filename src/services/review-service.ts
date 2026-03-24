<<<<<<< HEAD
import type { Feedback, PaginatedResponse } from './../types'
import { BaseService } from './base-service'
import { PAGE_SIZE } from '../config'

type WooCommerceReview = {
  id: number
  date_created: string
  date_created_gmt: string
  date_modified: string
  date_modified_gmt: string
  product_id: number
  status: string
  reviewer: string
  reviewer_email: string
  review: string
  rating: number
  verified: boolean
  reviewer_avatar_urls: {
    [key: string]: string
  }
  meta_data: any[]
}

interface ReviewExtended extends Feedback {
  productId: string
  reviewerName: string
  reviewerEmail: string
  verified: boolean
  avatarUrl: string
}

function transformReview(review: WooCommerceReview): ReviewExtended {
  return {
    id: review.id.toString(),
    rating: review.rating,
    comment: review.review,
    title: '',
    userId: '',
    userName: review.reviewer,
    productId: review.product_id.toString(),
    status: review.status,
    createdAt: review.date_created,
    updatedAt: review.date_modified,
    reviewerName: review.reviewer,
    reviewerEmail: review.reviewer_email,
    verified: review.verified,
    avatarUrl: review.reviewer_avatar_urls?.['96'] || ''
  }
}

/**
 * ReviewService provides functionality for working with WooCommerce product reviews
 *
 * This service helps with:
 * - Fetching product reviews from WooCommerce
 * - Creating and managing product reviews
 * - Getting review statistics
 */
export class ReviewService extends BaseService {
  private static instance: ReviewService

  /**
   * Get the singleton instance
   *
   * @returns {ReviewService} The singleton instance of ReviewService
   */
=======
import { BaseService } from './base-service.js'

export class ReviewService extends BaseService {
  private static instance: ReviewService

>>>>>>> f348a1b (feat: product listing)
  static getInstance(): ReviewService {
    if (!ReviewService.instance) {
      ReviewService.instance = new ReviewService()
    }
    return ReviewService.instance
  }

<<<<<<< HEAD
  /**
   * Fetches reviews from the WooCommerce API with filtering options
   *
   * @param {Object} options - The request options
   * @param {string} [options.productId=''] - Filter by product ID
   * @param {string} [options.search=''] - Search query for reviews
   * @param {string} [options.sort='-date_created'] - Sort order
   * @param {number} [options.currentPage=1] - Page number for pagination
   * @returns {Promise<PaginatedResponse<ReviewExtended>>} Paginated list of reviews
   * @api {get} /wp-json/wc/v3/products/reviews List reviews
   *
   * @example
   * // Example usage
   * const result = await reviewService.fetchReviews({ productId: '123' });
   */
  async fetchReviews({
    productId = '',
    search = '',
    sort = '-date_created',
    currentPage = 1
  }: {
    productId?: string
    search?: string
    sort?: string
    currentPage?: number
  }): Promise<PaginatedResponse<ReviewExtended>> {
    const searchParams = new URLSearchParams()
    searchParams.set('page', currentPage.toString())
    searchParams.set('per_page', String(PAGE_SIZE))
    
    if (productId) {
      searchParams.set('product', productId)
    }
    if (search) {
      searchParams.set('search', search)
    }
    searchParams.set('orderby', sort.startsWith('-') ? sort.substring(1) : sort)
    searchParams.set('order', sort.startsWith('-') ? 'desc' : 'asc')

    const reviews = await this.get<WooCommerceReview[]>(`/wp-json/wc/v3/products/reviews?` + searchParams.toString())

    return {
      page: currentPage,
      pageSize: PAGE_SIZE,
      count: reviews.length,
      data: reviews.map(transformReview),
      noOfPage: Math.ceil(reviews.length / PAGE_SIZE)
    }
  }

  /**
   * Fetches all reviews with optional search and sorting
   *
   * @param {Object} options - The request options
   * @param {string} [options.search=''] - Search query for reviews
   * @param {string} [options.sort='-date_created'] - Sort order
   * @param {number} [options.currentPage=1] - Page number for pagination
   * @returns {Promise<PaginatedResponse<ReviewExtended>>} Paginated list of reviews
   */
  async allReviews({
    search = '',
    sort = '-date_created',
    currentPage = 1
  }: {
    search?: string
    sort?: string
    currentPage?: number
  }): Promise<PaginatedResponse<ReviewExtended>> {
    return this.fetchReviews({ search, sort, currentPage })
  }

  /**
   * Fetches reviews for a specific product
   *
   * @param {string} productId - The ID of the product
   * @param {Object} options - Additional options
   * @param {number} [options.page=1] - Page number
   * @param {string} [options.sort='-date_created'] - Sort order
   * @returns {Promise<PaginatedResponse<ReviewExtended>>} Paginated list of reviews
   */
  async fetchProducrReviews(productId: string, options?: {
    page?: number
    sort?: string
  }): Promise<PaginatedResponse<ReviewExtended>> {
    return this.fetchReviews({
      productId,
      currentPage: options?.page || 1,
      sort: options?.sort || '-date_created'
    })
  }

  /**
   * Gets review statistics for a product
   *
   * @param {string} productId - The ID of the product
   * @returns {Promise<{ averageRating: number; reviewCount: number; ratingDistribution: { [key: number]: number } }>} Review statistics
   */
  async getProductReviewStats(productId: string): Promise<{
    averageRating: number
    reviewCount: number
    ratingDistribution: { [key: number]: number }
  }> {
    const reviews = await this.fetchReviews({ productId, currentPage: 1 })
    
    const ratingDistribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    let totalRating = 0
    
    reviews.data.forEach((review: ReviewExtended) => {
      if (review.rating >= 1 && review.rating <= 5) {
        ratingDistribution[review.rating]++
        totalRating += review.rating
      }
    })
    
    const reviewCount = reviews.data.length
    const averageRating = reviewCount > 0 ? totalRating / reviewCount : 0

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCount,
      ratingDistribution
    }
  }

  /**
   * Creates a new review
   *
   * @param {Object} data - The review data to create
   * @returns {Promise<ReviewExtended>} The created review
   * @api {post} /wp-json/wc/v3/products/:productId/reviews Create review
   *
   * @example
   * // Example usage
   * const newReview = await reviewService.saveReview({
   *   productId: '123',
   *   review: 'Great product!',
   *   rating: 5,
   *   reviewer: 'John Doe',
   *   reviewer_email: 'john@example.com'
   * });
   */
  async saveReview(data: {
    productId: string
    review: string
    rating: number
    reviewer: string
    reviewer_email: string
  }): Promise<ReviewExtended> {
    const review = await this.post<WooCommerceReview>(
      `/wp-json/wc/v3/products/${data.productId}/reviews`,
      {
        review: data.review,
        rating: data.rating,
        reviewer: data.reviewer,
        reviewer_email: data.reviewer_email
      }
    )
    return transformReview(review)
  }

  /**
   * Updates an existing review
   *
   * @param {string} reviewId - The ID of the review to update
   * @param {Object} data - The review data to update
   * @returns {Promise<ReviewExtended>} The updated review
   */
  async updateReview(reviewId: string, data: {
    review?: string
    rating?: number
  }): Promise<ReviewExtended> {
    // Get the product ID from the review first
    const existingReview = await this.get<WooCommerceReview>(`/wp-json/wc/v3/products/reviews/${reviewId}`)
    
    const review = await this.put<WooCommerceReview>(
      `/wp-json/wc/v3/products/reviews/${reviewId}`,
      data
    )
    return transformReview(review)
  }

  /**
   * Deletes a review
   *
   * @param {string} reviewId - The ID of the review to delete
   * @param {boolean} [force=false] - Whether to force delete
   * @returns {Promise<{ deleted: boolean }>} The deletion result
   */
  async deleteReview(reviewId: string, force: boolean = false): Promise<{ deleted: boolean }> {
    const result = await this.delete<{ deleted: boolean }>(
      `/wp-json/wc/v3/products/reviews/${reviewId}?force=${force}`
    )
    return result
  }
}

// Use singleton instance
=======
  async list(productId: string) {
    return this.get<any[]>('/wp-json/wc/v3/products/reviews', { product: productId })
  }

  async create(data: any) {
    return this.post<any>('/wp-json/wc/v3/products/reviews', data)
  }
}

>>>>>>> f348a1b (feat: product listing)
export const reviewService = ReviewService.getInstance()
