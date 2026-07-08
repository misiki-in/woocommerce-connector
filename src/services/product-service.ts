import type { PaginatedResponse, Product } from '../types'
import { mapProductGeneric, getPath } from '../mappers/generic.mapper'
import { BaseService } from './base.service'

const FIELDS = {"id":"id","title":"name","slug":"slug","price":"price","mrp":"regular_price","description":"description","image":"images.0.src","stock":"stock_quantity"} as const

/** ProductService — WooCommerce. Signatures mirror @misiki/litekart-connector. */
export class ProductService extends BaseService {
  private static instance: ProductService
  static getInstance(): ProductService { if (!ProductService.instance) ProductService.instance = new ProductService(); return ProductService.instance }

  async list({ page = 1, search = '', sort = '-createdAt' }: { page?: number; search?: string; sort?: string } = {}): Promise<PaginatedResponse<Product>> {
    void search; void sort
    const raw = await this.get<any>('/products')
    const arr: any[] = Array.isArray(raw) ? raw : (raw.data || raw.items || [])
    const data = arr.map((x) => mapProductGeneric(x, FIELDS, { storeId: this.creds.storeId }))
    return { data, count: data.length, pageSize: 20, noOfPage: 1, page }
  }
  async listFeaturedProducts(o: { page?: number; sort?: string } = {}) { return this.list(o) }
  async listTrendingProducts(o: { page?: number; search?: string; sort?: string } = {}) { return this.list(o) }
  async listRelatedProducts(o: { page?: number; categoryId?: string; sort?: string } = {}) { return this.list({ page: o.page }) }
  async getOne(slug: string): Promise<Product> {
    const raw = await this.get<any>('/products/' + slug)
    const obj = getPath(raw, '')?.[0] || raw
    return mapProductGeneric(obj, FIELDS, { storeId: this.creds.storeId })
  }
  async addReview(_a: any) { return this.dummy({ success: true }) }
  async fetchReels() { return this.dummy([] as unknown[]) }
}
export const productService = ProductService.getInstance()
