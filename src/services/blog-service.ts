import { BaseService } from './base.service'
/** BlogService — present-but-dummy (mirrors litekart-connector); returns dummy data, never throws. */
export class BlogService extends BaseService {
  private static instance: BlogService
  static getInstance(): BlogService { if (!BlogService.instance) BlogService.instance = new BlogService(); return BlogService.instance }
  async list(..._args: any[]): Promise<any> { return this.emptyPage() }
  async getOne(..._args: any[]): Promise<any> { return this.dummy({}) }
}
export const blogService = BlogService.getInstance()
