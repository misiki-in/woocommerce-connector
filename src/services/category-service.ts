import type { Category, PaginatedResponse, Product } from '../types'
import { BaseService } from './base.service'
import { PRODUCT_PAGE_SIZE, WOO_MAX_PER_PAGE, mapWooProduct, wooProductSort } from './product-service'

/**
 * CategoryService — WooCommerce. Signatures mirror @misiki/litekart-connector.
 *
 * Categories are WordPress terms of the `product_cat` taxonomy:
 *   GET /products/categories        https://woocommerce.github.io/woocommerce-rest-api-docs/#list-all-product-categories
 *   GET /products/categories/{id}   (numeric term id ONLY — there is no /categories/{slug})
 *
 * Term sorting is `orderby` + `order`, where orderby is one of
 * id, include, name, slug, term_group, description, count (default name/asc).
 * There is no date column on a term, so litekart's `-createdAt` cannot be honoured.
 */

/** litekart's `-field` sort token -> WooCommerce term orderby/order pair. */
function wooTermSort(sort?: string): { orderby: string; order: 'asc' | 'desc' } {
  const raw = (sort || '').trim()
  const order: 'asc' | 'desc' = raw.startsWith('-') ? 'desc' : 'asc'
  const field = raw.replace(/^-/, '')
  const map: Record<string, string> = { id: 'id', name: 'name', title: 'name', slug: 'slug', description: 'description', count: 'count', productCount: 'count' }
  const orderby = map[field]
  // Terms have no created/modified date: anything date-ish falls back to WooCommerce's
  // own default (name/asc) instead of sending an orderby the controller would reject.
  if (!orderby) return { orderby: 'name', order: 'asc' }
  return { orderby, order }
}

/**
 * Map a product_cat term into the litekart Category shape.
 * (mapCategoryGeneric() is not used here: it hardcodes parentId/description/image to null
 * and WooCommerce returns all three.)
 */
export function mapWooCategory(raw: any): Category {
  return {
    id: String(raw?.id ?? ''),
    title: String(raw?.name ?? ''),
    slug: raw?.slug ?? null,
    // `parent` is 0 for top-level terms.
    parentId: raw?.parent ? String(raw.parent) : null,
    description: raw?.description || null,
    image: raw?.image?.src ?? null
  }
}

/** CategoryService — WooCommerce. Signatures mirror @misiki/litekart-connector. */
export class CategoryService extends BaseService {
  private static instance: CategoryService
  static getInstance(): CategoryService { if (!CategoryService.instance) CategoryService.instance = new CategoryService(); return CategoryService.instance }

  /** One page of GET /products/categories, with the real totals from the response headers. */
  protected async queryCategories(params: Record<string, unknown>, page: number, perPage: number): Promise<PaginatedResponse<Category>> {
    const res = await this.getPaged<any>('/products/categories' + this.qs({ page, per_page: perPage, ...params }))
    return { data: res.data.map(mapWooCategory), count: res.total, pageSize: perPage, noOfPage: res.totalPages, page }
  }

  /**
   * Walk every page of GET /products/categories. `per_page` maxes out at 100, so a store
   * with a deep taxonomy needs several round trips; capped at `maxPages` (500 terms) so a
   * misconfigured store cannot turn one call into an unbounded request loop.
   */
  protected async allCategoryTerms(params: Record<string, unknown> = {}, maxPages = 5): Promise<{ rows: any[]; total: number }> {
    const first = await this.getPaged<any>('/products/categories' + this.qs({ page: 1, per_page: WOO_MAX_PER_PAGE, ...params }))
    const rows = [...first.data]
    for (let page = 2; page <= Math.min(first.totalPages, maxPages); page++) {
      const next = await this.getPaged<any>('/products/categories' + this.qs({ page, per_page: WOO_MAX_PER_PAGE, ...params }))
      rows.push(...next.data)
    }
    return { rows, total: first.total }
  }

  /**
   * GET /products/categories?per_page=100 (following pages).
   * The previous implementation omitted `per_page` and therefore returned only the first
   * 10 categories, which is WooCommerce's default page size on every list route.
   */
  async fetchAllCategories(): Promise<PaginatedResponse<Category>> {
    const { rows, total } = await this.allCategoryTerms()
    return { data: rows.map(mapWooCategory), count: total, pageSize: rows.length, noOfPage: 1, page: 1 }
  }

  /**
   * APPROXIMATION — WooCommerce has no "featured" flag on categories (only on products),
   * and there is no /products/categories/featured route. The closest honest stand-in is
   * the most-used categories: orderby=count&order=desc, empty categories hidden.
   */
  async fetchFeaturedCategories({ limit = 100 }: { limit?: number } = {}): Promise<PaginatedResponse<Category>> {
    const perPage = Math.min(Math.max(Number(limit) || 100, 1), WOO_MAX_PER_PAGE)
    return this.queryCategories({ orderby: 'count', order: 'desc', hide_empty: true }, 1, perPage)
  }

  /** GET /products/categories?search=&orderby=&order=&hide_empty=true — a footer list wants categories that actually have products. */
  async fetchFooterCategories({ page = 1, q = '', sort = '-createdAt' }: { page?: number; q?: string; sort?: string } = {}): Promise<PaginatedResponse<Category>> {
    const { orderby, order } = wooTermSort(sort)
    return this.queryCategories({ search: q, orderby, order, hide_empty: true }, page, PRODUCT_PAGE_SIZE)
  }

  /**
   * Numeric id -> GET /products/categories/{id}; slug -> GET /products/categories?slug=
   * and take [0]. litekart calls this with a handle/slug, and v3 has no
   * /products/categories/{slug} route (only the Store API accepts slugs in a path).
   */
  async fetchCategory(id: string): Promise<Category> {
    if (/^\d+$/.test(String(id))) return mapWooCategory(await this.get<any>('/products/categories/' + id))
    const rows = await this.get<any[]>('/products/categories' + this.qs({ slug: id, per_page: 1 }))
    const raw = Array.isArray(rows) ? rows[0] : rows
    if (!raw || raw.id == null) throw { message: `Category "${id}" was not found.` }
    return mapWooCategory(raw)
  }

  /**
   * GET /products?category={termId}. On v3 `category` takes the numeric TERM id, so a
   * slug is resolved through /products/categories?slug= first.
   * (`page` is an additive extra: litekart's signature is (id) only.)
   */
  async fetchAllProductsOfCategories(id: string, { page = 1, sort = '-createdAt' }: { page?: number; sort?: string } = {}): Promise<PaginatedResponse<Product>> {
    const empty = { data: [] as Product[], count: 0, pageSize: PRODUCT_PAGE_SIZE, noOfPage: 0, page }
    if (!id) return empty
    let termId = String(id)
    if (!/^\d+$/.test(termId)) {
      const rows = await this.get<any[]>('/products/categories' + this.qs({ slug: id, per_page: 1 }))
      termId = Array.isArray(rows) && rows[0]?.id != null ? String(rows[0].id) : ''
    }
    if (!termId) return empty
    const { orderby, order } = wooProductSort(sort)
    const res = await this.getPaged<any>('/products' + this.qs({ category: termId, page, per_page: PRODUCT_PAGE_SIZE, orderby, order, status: 'publish' }))
    return {
      data: res.data.map((x) => mapWooProduct(x, { storeId: this.creds.storeId })),
      count: res.total,
      pageSize: PRODUCT_PAGE_SIZE,
      noOfPage: res.totalPages,
      page
    }
  }

  /**
   * WooCommerce has no megamenu resource, and WP nav menus (wp/v2/menus, wp/v2/menu-items)
   * need a WordPress user with edit_theme_options — the ck/cs key does not authenticate WP
   * core, so those routes answer 401. The honest equivalent is the whole product_cat tree:
   * every term, ordered by menu_order, with `parentId` populated so the caller can nest it.
   */
  async getMegamenu(): Promise<PaginatedResponse<Category>> {
    const { rows, total } = await this.allCategoryTerms({ hide_empty: true })
    const ordered = [...rows].sort((a, b) => (Number(a?.menu_order ?? 0) - Number(b?.menu_order ?? 0)) || String(a?.name ?? '').localeCompare(String(b?.name ?? '')))
    return { data: ordered.map(mapWooCategory), count: total, pageSize: ordered.length, noOfPage: 1, page: 1 }
  }
}
export const categoryService = CategoryService.getInstance()
