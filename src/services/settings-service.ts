import { BaseService } from './base.service'
/** SettingService — present-but-dummy (mirrors litekart-connector); returns dummy data, never throws. */
export class SettingService extends BaseService {
  private static instance: SettingService
  static getInstance(): SettingService { if (!SettingService.instance) SettingService.instance = new SettingService(); return SettingService.instance }
  async fetchSetting(..._args: any[]): Promise<any> { return this.dummy({}) }
  async saveSettings(..._args: any[]): Promise<any> { return this.dummy({}) }
  async updateSettings(..._args: any[]): Promise<any> { return this.dummy({}) }
}
export const settingsService = SettingService.getInstance()
