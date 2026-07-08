import { BaseService } from './base.service'
/** FeedbackService — present-but-dummy (mirrors litekart-connector); returns dummy data, never throws. */
export class FeedbackService extends BaseService {
  private static instance: FeedbackService
  static getInstance(): FeedbackService { if (!FeedbackService.instance) FeedbackService.instance = new FeedbackService(); return FeedbackService.instance }
  async listFeedbacks(..._args: any[]): Promise<any> { return this.emptyPage() }
}
export const feedbackService = FeedbackService.getInstance()
