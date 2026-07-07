import { BaseService } from './base.service'
import { EP } from '../endpoints'

export class SearchService extends BaseService {
  searchWithQuery(query: string) {
    if (!EP.search) return this.unsupported('search.searchWithQuery')
    return this.listAt(EP.search, { search: query })
  }
  searchWithUrl(url: URL, slug?: string) {
    if (!EP.search) return this.unsupported('search.searchWithUrl')
    void slug
    return this.listAt(EP.search, { search: url.searchParams.get('q') || '' })
  }
  emptyResult() {
    return { data: [], total: 0, page: 1, perPage: 0 }
  }
}
