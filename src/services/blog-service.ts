import { BaseService } from './base.service'
import { EP } from '../endpoints'

export class BlogService extends BaseService {
  list(opts: { page?: number; perPage?: number; search?: string } = {}) {
    if (!EP.blog) return this.unsupported('blog.list')
    return this.listAt(EP.blog, opts)
  }
  getOne(id: string | number) {
    if (!EP.blog) return this.unsupported('blog.getOne')
    return this.get(`${EP.blog}/${id}`)
  }
}
