import { BaseService } from './base.service'

export class PopularSearchService extends BaseService {
  listPopularSearch(opts: Record<string, unknown> = {}) { return this.unsupported('popularSearch.listPopularSearch') }
}
