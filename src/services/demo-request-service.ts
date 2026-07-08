import { BaseService } from './base.service'
/** DemoRequestService — present-but-dummy (mirrors litekart-connector); returns dummy data, never throws. */
export class DemoRequestService extends BaseService {
  private static instance: DemoRequestService
  static getInstance(): DemoRequestService { if (!DemoRequestService.instance) DemoRequestService.instance = new DemoRequestService(); return DemoRequestService.instance }
  async saveScheduleDemo(..._args: any[]): Promise<any> { return this.dummy({}) }
}
export const demoRequestService = DemoRequestService.getInstance()
