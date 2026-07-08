import { BaseService } from './base.service'
/** PageService — present-but-dummy (mirrors litekart-connector); returns dummy data, never throws. */
export class PageService extends BaseService {
  private static instance: PageService
  static getInstance(): PageService { if (!PageService.instance) PageService.instance = new PageService(); return PageService.instance }
  async list(..._args: any[]): Promise<any> { return this.emptyPage() }
  async listLatestPages(..._args: any[]): Promise<any> { return this.emptyPage() }
  async getOne(..._args: any[]): Promise<any> { return this.dummy({}) }
}
export const pageService = PageService.getInstance()
