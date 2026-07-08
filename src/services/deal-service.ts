import { BaseService } from './base.service'
/** DealService — present-but-dummy (mirrors litekart-connector); returns dummy data, never throws. */
export class DealService extends BaseService {
  private static instance: DealService
  static getInstance(): DealService { if (!DealService.instance) DealService.instance = new DealService(); return DealService.instance }
  async fetchDeals(..._args: any[]): Promise<any> { return this.emptyPage() }
}
export const dealService = DealService.getInstance()
