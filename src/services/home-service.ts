import { BaseService } from './base.service'
/** HomeService — present-but-dummy (mirrors litekart-connector); returns dummy data, never throws. */
export class HomeService extends BaseService {
  private static instance: HomeService
  static getInstance(): HomeService { if (!HomeService.instance) HomeService.instance = new HomeService(); return HomeService.instance }
  async getHome(..._args: any[]): Promise<any> { return this.dummy({}) }
}
export const homeService = HomeService.getInstance()
