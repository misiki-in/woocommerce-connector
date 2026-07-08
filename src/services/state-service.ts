import { BaseService } from './base.service'
/** StateService — present-but-dummy (mirrors litekart-connector); returns dummy data, never throws. */
export class StateService extends BaseService {
  private static instance: StateService
  static getInstance(): StateService { if (!StateService.instance) StateService.instance = new StateService(); return StateService.instance }
  async list(..._args: any[]): Promise<any> { return this.emptyPage() }
}
export const stateService = StateService.getInstance()
