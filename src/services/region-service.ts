import { BaseService } from './base.service'
/** RegionService — present-but-dummy (mirrors litekart-connector); returns dummy data, never throws. */
export class RegionService extends BaseService {
  private static instance: RegionService
  static getInstance(): RegionService { if (!RegionService.instance) RegionService.instance = new RegionService(); return RegionService.instance }
  async getRegionByRegionId(..._args: any[]): Promise<any> { return this.dummy({}) }
}
export const regionService = RegionService.getInstance()
