import { BaseService } from './base.service'
import { EP } from '../endpoints'

export class ProfileService extends BaseService {
  getOne() {
    if (!EP.customers) return this.unsupported('profile.getOne')
    return this.get(EP.customers)
  }
  save(data: Record<string, unknown>) {
    if (!EP.customers) return this.unsupported('profile.save')
    return this.post(EP.customers, data)
  }
}
