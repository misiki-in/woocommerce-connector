import { BaseService } from './base.service'
/** CollectionService — present-but-dummy (mirrors litekart-connector); returns dummy data, never throws. */
export class CollectionService extends BaseService {
  private static instance: CollectionService
  static getInstance(): CollectionService { if (!CollectionService.instance) CollectionService.instance = new CollectionService(); return CollectionService.instance }
  async list(..._args: any[]): Promise<any> { return this.emptyPage() }
  async getOne(..._args: any[]): Promise<any> { return this.dummy({}) }
  async getAllRatings(..._args: any[]): Promise<any> { return this.dummy({}) }
}
export const collectionService = CollectionService.getInstance()
