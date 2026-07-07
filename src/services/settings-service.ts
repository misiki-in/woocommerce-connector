import { BaseService } from './base.service'
import { EP } from '../endpoints'

export class SettingService extends BaseService {
  fetchSetting() {
    if (!EP.settings) return this.unsupported('settings.fetchSetting')
    return this.get(EP.settings)
  }
  saveSettings(data: Record<string, unknown>) {
    if (!EP.settings) return this.unsupported('settings.saveSettings')
    return this.post(EP.settings, data)
  }
  updateSettings(id: string | number, data: Record<string, unknown>) {
    if (!EP.settings) return this.unsupported('settings.updateSettings')
    return this.put(`${EP.settings}/${id}`, data)
  }
}
