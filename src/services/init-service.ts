import { BaseService } from './base.service'
/** InitService — present-but-dummy (mirrors litekart-connector); returns dummy data, never throws. */
export class InitService extends BaseService {
  private static instance: InitService
  static getInstance(): InitService { if (!InitService.instance) InitService.instance = new InitService(); return InitService.instance }
  async fetchInit(..._args: any[]): Promise<any> { return this.dummy({}) }
}
export const initService = InitService.getInstance()
