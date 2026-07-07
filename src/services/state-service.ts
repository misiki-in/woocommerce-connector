import { BaseService } from './base.service'
import { EP } from '../endpoints'

export class StateService extends BaseService {
  list(opts: { page?: number; perPage?: number; search?: string } = {}) {
    if (!EP.states) return this.unsupported('state.list')
    return this.listAt(EP.states, opts)
  }
}
