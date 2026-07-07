import { BaseService } from './base.service'

export class ContactService extends BaseService {
  submitContactUsForm(data: Record<string, unknown>) { return this.unsupported('contact.submitContactUsForm') }
}
