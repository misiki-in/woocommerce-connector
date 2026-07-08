import type { Category } from '../types'
import { mapCategoryGeneric, getPath } from '../mappers/generic.mapper'
import { BaseService } from './base.service'
const FIELDS = {"id":"id","title":"name","slug":"slug"} as const
/** CategoryService — WooCommerce. Signatures mirror @misiki/litekart-connector. */
export class CategoryService extends BaseService {
  private static instance: CategoryService
  static getInstance(): CategoryService { if (!CategoryService.instance) CategoryService.instance = new CategoryService(); return CategoryService.instance }
  async fetchAllCategories(): Promise<Category[]> {
    const raw = await this.get<any>('/products/categories')
    const arr: any[] = Array.isArray(raw) ? raw : (raw.data || raw.items || [])
    return arr.map((x) => mapCategoryGeneric(x, FIELDS))
  }
  async fetchFeaturedCategories() { return this.fetchAllCategories() }
  async fetchFooterCategories() { return this.fetchAllCategories() }
  async fetchCategory(id: string): Promise<Category> {
    try { const raw = await this.get<any>('/products/categories/' + id); return mapCategoryGeneric(raw, FIELDS) } catch { return mapCategoryGeneric({ id }, FIELDS) }
  }
  async fetchAllProductsOfCategories(_id: string) { return this.emptyPage() }
  async getMegamenu() { return this.fetchAllCategories() }
}
export const categoryService = CategoryService.getInstance()
