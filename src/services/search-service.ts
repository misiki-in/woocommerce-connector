import { BaseService } from './base.service'
/** SearchService — present-but-dummy (mirrors litekart-connector); returns dummy data, never throws. */
export class SearchService extends BaseService {
  private static instance: SearchService
  static getInstance(): SearchService { if (!SearchService.instance) SearchService.instance = new SearchService(); return SearchService.instance }
  async searchWithUrl(..._args: any[]): Promise<any> { return this.emptyPage() }
  async searchWithQuery(..._args: any[]): Promise<any> { return this.emptyPage() }
  async emptyResult(..._args: any[]): Promise<any> { return { data: [], count: 0, pageSize: 0, noOfPage: 0, page: 1 } }
}
export const searchService = SearchService.getInstance()
