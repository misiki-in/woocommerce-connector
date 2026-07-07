import { BaseService } from './base.service'
import { EP } from '../endpoints'

export class ProductService extends BaseService {
  list(opts: { page?: number; perPage?: number; search?: string } = {}) {
    if (!EP.products) return this.unsupported('product.list')
    return this.listAt(EP.products, opts)
  }
  getOne(slug: string | number) {
    if (!EP.products) return this.unsupported('product.getOne')
    return this.get(`${EP.products}/${slug}`)
  }
  listFeaturedProducts(opts: { page?: number; perPage?: number } = {}) {
    if (!EP.products) return this.unsupported('product.listFeaturedProducts')
    return this.listAt(EP.products, { ...opts, search: 'featured' })
  }
  listTrendingProducts(opts: { page?: number; perPage?: number; search?: string } = {}) {
    if (!EP.products) return this.unsupported('product.listTrendingProducts')
    return this.listAt(EP.products, opts)
  }
  listRelatedProducts({ categoryId, page = 1 }: { categoryId?: string | number; page?: number } = {}) {
    if (!EP.products) return this.unsupported('product.listRelatedProducts')
    void categoryId
    return this.listAt(EP.products, { page })
  }
  addReview(data: Record<string, unknown>) {
    if (!EP.reviews) return this.unsupported('product.addReview')
    return this.post(EP.reviews, data)
  }
  create(data: Record<string, unknown>) {
    if (!EP.products) return this.unsupported('product.create')
    return this.post(EP.products, data)
  }
  update(id: string | number, data: Record<string, unknown>) {
    if (!EP.products) return this.unsupported('product.update')
    return this.put(`${EP.products}/${id}`, data)
  }
  remove(id: string | number) {
    if (!EP.products) return this.unsupported('product.remove')
    return this.delete(`${EP.products}/${id}`)
  }
  fetchReels() { return this.unsupported('product.fetchReels') }
}
