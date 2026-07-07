import { BaseService } from './base.service'

export class EnquiryService extends BaseService {
  create(data: Record<string, unknown>) { return this.unsupported('enquiry.create') }
}
