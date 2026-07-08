import { BaseService } from './base.service'
/** PopularityService — present-but-dummy (mirrors litekart-connector); returns dummy data, never throws. */
export class PopularityService extends BaseService {
  private static instance: PopularityService
  static getInstance(): PopularityService { if (!PopularityService.instance) PopularityService.instance = new PopularityService(); return PopularityService.instance }
  async updatePopularity(..._args: any[]): Promise<any> { return this.dummy({}) }
}
export const popularityService = PopularityService.getInstance()
