import { BaseService } from './base.service'
/** FaqService — present-but-dummy (mirrors litekart-connector); returns dummy data, never throws. */
export class FaqService extends BaseService {
  private static instance: FaqService
  static getInstance(): FaqService { if (!FaqService.instance) FaqService.instance = new FaqService(); return FaqService.instance }
  async listFaqs(..._args: any[]): Promise<any> { return this.emptyPage() }
}
export const faqService = FaqService.getInstance()
