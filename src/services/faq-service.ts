import { BaseService } from './base.service'

export class FaqService extends BaseService {
  listFaqs(opts: Record<string, unknown> = {}) { return this.unsupported('faq.listFaqs') }
}
