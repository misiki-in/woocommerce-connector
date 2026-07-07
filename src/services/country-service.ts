import { BaseService } from './base.service'
import { EP } from '../endpoints'

export class CountryService extends BaseService {
  list(opts: { page?: number; perPage?: number; search?: string } = {}) {
    if (!EP.countries) return this.unsupported('country.list')
    return this.listAt(EP.countries, opts)
  }
}
