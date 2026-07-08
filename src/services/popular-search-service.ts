import { BaseService } from './base.service'
/** PopularSearchService — present-but-dummy (mirrors litekart-connector); returns dummy data, never throws. */
export class PopularSearchService extends BaseService {
  private static instance: PopularSearchService
  static getInstance(): PopularSearchService { if (!PopularSearchService.instance) PopularSearchService.instance = new PopularSearchService(); return PopularSearchService.instance }
  async listPopularSearch(..._args: any[]): Promise<any> { return this.emptyPage() }
}
export const popularSearchService = PopularSearchService.getInstance()
