import { BaseService } from './base.service'
/** BannerService — present-but-dummy (mirrors litekart-connector); returns dummy data, never throws. */
export class BannerService extends BaseService {
  private static instance: BannerService
  static getInstance(): BannerService { if (!BannerService.instance) BannerService.instance = new BannerService(); return BannerService.instance }
  async list(..._args: any[]): Promise<any> { return this.emptyPage() }
  async fetchBannersGroup(..._args: any[]): Promise<any> { return this.dummy({}) }
}
export const bannerService = BannerService.getInstance()
