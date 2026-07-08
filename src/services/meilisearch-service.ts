import { BaseService } from './base.service'
/** MeilisearchService — present-but-dummy (mirrors litekart-connector); returns dummy data, never throws. */
export class MeilisearchService extends BaseService {
  private static instance: MeilisearchService
  static getInstance(): MeilisearchService { if (!MeilisearchService.instance) MeilisearchService.instance = new MeilisearchService(); return MeilisearchService.instance }
  async search(..._args: any[]): Promise<any> { return this.emptyPage() }
  async searchAutoComplete(..._args: any[]): Promise<any> { return this.emptyPage() }
}
export const meilisearchService = MeilisearchService.getInstance()
