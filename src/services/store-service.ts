import { BaseService } from './base.service'
/** StoreService — present-but-dummy (mirrors litekart-connector); returns dummy data, never throws. */
export class StoreService extends BaseService {
  private static instance: StoreService
  static getInstance(): StoreService { if (!StoreService.instance) StoreService.instance = new StoreService(); return StoreService.instance }
  async getStoreByIdOrDomain(..._args: any[]): Promise<any> { return this.dummy({}) }
}
export const storeService = StoreService.getInstance()
