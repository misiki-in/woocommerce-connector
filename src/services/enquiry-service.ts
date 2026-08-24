import { BaseService } from './base.service'
/** EnquiryService — present-but-dummy (mirrors the storefront contract); returns dummy data, never throws. */
export class EnquiryService extends BaseService {
  private static instance: EnquiryService
  static getInstance(): EnquiryService { if (!EnquiryService.instance) EnquiryService.instance = new EnquiryService(); return EnquiryService.instance }
  async create(..._args: any[]): Promise<any> { return this.dummy({}) }
}
export const enquiryService = EnquiryService.getInstance()
