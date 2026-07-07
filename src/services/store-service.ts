import { BaseService } from './base.service'
import { EP } from '../endpoints'

export class StoreService extends BaseService {
  getStoreByIdOrDomain(idOrDomain?: string) {
    if (!EP.settings) return this.unsupported('store.getStoreByIdOrDomain')
    void idOrDomain
    return this.get(EP.settings)
  }
}
