import { BaseService } from './base.service'
import { EP } from '../endpoints'

export class PageService extends BaseService {
  list(opts: { page?: number; perPage?: number; search?: string } = {}) {
    if (!EP.pages) return this.unsupported('page.list')
    return this.listAt(EP.pages, opts)
  }
  listLatestPages(opts: { page?: number; perPage?: number } = {}) {
    if (!EP.pages) return this.unsupported('page.listLatestPages')
    return this.listAt(EP.pages, opts)
  }
  getOne(id: string | number) {
    if (!EP.pages) return this.unsupported('page.getOne')
    return this.get(`${EP.pages}/${id}`)
  }
}
