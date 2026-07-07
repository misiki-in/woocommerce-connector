import { BaseService } from './base.service'

export class MeilisearchService extends BaseService {
  search(params: Record<string, unknown>) { return this.unsupported('meilisearch.search') }
  searchAutoComplete(params: Record<string, unknown>) { return this.unsupported('meilisearch.searchAutoComplete') }
}
