import { BaseService } from './base.service'
/** ReviewService — present-but-dummy (mirrors litekart-connector); returns dummy data, never throws. */
export class ReviewService extends BaseService {
  private static instance: ReviewService
  static getInstance(): ReviewService { if (!ReviewService.instance) ReviewService.instance = new ReviewService(); return ReviewService.instance }
  async fetchReviews(..._args: any[]): Promise<any> { return this.emptyPage() }
  async allReviews(..._args: any[]): Promise<any> { return this.emptyPage() }
  async fetchProducrReviews(..._args: any[]): Promise<any> { return this.emptyPage() }
  async saveReview(..._args: any[]): Promise<any> { return this.dummy({}) }
}
export const reviewService = ReviewService.getInstance()
