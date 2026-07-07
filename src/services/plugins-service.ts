import { BaseService } from './base.service'

export class PluginService extends BaseService {
  list(opts: Record<string, unknown> = {}) { return this.unsupported('plugins.list') }
}
