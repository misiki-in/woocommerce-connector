import { BaseService } from './base.service'
/** PluginService — present-but-dummy (mirrors the storefront contract); returns dummy data, never throws. */
export class PluginService extends BaseService {
  private static instance: PluginService
  static getInstance(): PluginService { if (!PluginService.instance) PluginService.instance = new PluginService(); return PluginService.instance }
  async list(..._args: any[]): Promise<any> { return this.emptyPage() }
}
export const pluginsService = PluginService.getInstance()
