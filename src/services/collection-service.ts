import { BaseService } from './base.service'
import { EP } from '../endpoints'

export class CollectionService extends BaseService {
  list(opts: { page?: number; perPage?: number; search?: string } = {}) {
    const path = EP.collections || EP.categories
    if (!path) return this.unsupported('collection.list')
    return this.listAt(path, opts)
  }
  getOne(id: string | number) {
    const path = EP.collections || EP.categories
    if (!path) return this.unsupported('collection.getOne')
    return this.get(`${path}/${id}`)
  }
  getAllRatings() { return this.unsupported('collection.getAllRatings') }
}
