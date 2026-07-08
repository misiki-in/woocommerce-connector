import { BaseService } from './base.service'
/** CountryService — present-but-dummy (mirrors litekart-connector); returns dummy data, never throws. */
export class CountryService extends BaseService {
  private static instance: CountryService
  static getInstance(): CountryService { if (!CountryService.instance) CountryService.instance = new CountryService(); return CountryService.instance }
  async list(..._args: any[]): Promise<any> { return this.emptyPage() }
}
export const countryService = CountryService.getInstance()
