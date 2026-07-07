import { BaseService } from './base.service'
import { EP } from '../endpoints'

export class AutocompleteService extends BaseService {
  list(query: string | { search?: string } = '') {
    if (!EP.search) return this.unsupported('autocomplete.list')
    const q = typeof query === 'string' ? query : (query.search || '')
    return this.listAt(EP.search, { search: q, perPage: 8 })
  }
}
