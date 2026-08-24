import { BaseService } from './base.service'
/** ReelsService — present-but-dummy (mirrors the storefront contract); returns dummy data, never throws. */
export class ReelsService extends BaseService {
  private static instance: ReelsService
  static getInstance(): ReelsService { if (!ReelsService.instance) ReelsService.instance = new ReelsService(); return ReelsService.instance }
  async list(..._args: any[]): Promise<any> { return this.emptyPage() }
}
export const reelsService = ReelsService.getInstance()
