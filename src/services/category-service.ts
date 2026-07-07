import { BaseService } from './base.service'
import { EP } from '../endpoints'

export class CategoryService extends BaseService {
  fetchAllCategories(opts: { page?: number; perPage?: number; search?: string } = {}) {
    if (!EP.categories) return this.unsupported('category.fetchAllCategories')
    return this.listAt(EP.categories, opts)
  }
  fetchCategory(id: string | number) {
    if (!EP.categories) return this.unsupported('category.fetchCategory')
    return this.get(`${EP.categories}/${id}`)
  }
  fetchFeaturedCategories(opts: { page?: number; perPage?: number } = {}) {
    if (!EP.categories) return this.unsupported('category.fetchFeaturedCategories')
    return this.listAt(EP.categories, opts)
  }
  fetchFooterCategories(opts: { page?: number; perPage?: number } = {}) {
    if (!EP.categories) return this.unsupported('category.fetchFooterCategories')
    return this.listAt(EP.categories, opts)
  }
  fetchAllProductsOfCategories(id: string | number) {
    if (!EP.products) return this.unsupported('category.fetchAllProductsOfCategories')
    return this.listAt(EP.products, { search: String(id) })
  }
  getMegamenu() { return this.unsupported('category.getMegamenu') }
}
