import { BaseService } from './base.service'
/** ContactService — present-but-dummy (mirrors litekart-connector); returns dummy data, never throws. */
export class ContactService extends BaseService {
  private static instance: ContactService
  static getInstance(): ContactService { if (!ContactService.instance) ContactService.instance = new ContactService(); return ContactService.instance }
  async submitContactUsForm(..._args: any[]): Promise<any> { return this.dummy({}) }
}
export const contactService = ContactService.getInstance()
