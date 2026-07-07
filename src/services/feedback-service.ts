import { BaseService } from './base.service'

export class FeedbackService extends BaseService {
  listFeedbacks(opts: Record<string, unknown> = {}) { return this.unsupported('feedback.listFeedbacks') }
}
