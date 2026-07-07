import { BaseService } from './base.service'
import { EP } from '../endpoints'

export class ReviewService extends BaseService {
  fetchReviews(opts: { page?: number; perPage?: number; search?: string } = {}) {
    if (!EP.reviews) return this.unsupported('review.fetchReviews')
    return this.listAt(EP.reviews, opts)
  }
  allReviews(opts: { page?: number; perPage?: number; search?: string } = {}) {
    if (!EP.reviews) return this.unsupported('review.allReviews')
    return this.listAt(EP.reviews, opts)
  }
  fetchProducrReviews(productId: string | number) {
    if (!EP.reviews) return this.unsupported('review.fetchProducrReviews')
    return this.listAt(EP.reviews, { search: String(productId) })
  }
  saveReview(data: Record<string, unknown>) {
    if (!EP.reviews) return this.unsupported('review.saveReview')
    return this.post(EP.reviews, data)
  }
}
