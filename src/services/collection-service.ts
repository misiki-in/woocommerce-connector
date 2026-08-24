import type { PaginatedResponse, Product } from '../types'
import { BaseService } from './base.service'
import { PRODUCT_PAGE_SIZE, mapWooProduct } from './product-service'

/**
 * CollectionService — WooCommerce. Signatures mirror the storefront contract.
 *
 * APPROXIMATION: WooCommerce has no "collection" object. The closest merchandising
 * grouping it ships with is the product TAG taxonomy (categories are already owned by
 * category-service), so a Collection here IS a product tag:
 *   GET /products/tags        https://woocommerce.github.io/woocommerce-rest-api-docs/#list-all-product-tags
 *   GET /products/tags/{id}   (numeric term id only — a slug goes through ?slug=)
 *   GET /products?tag={id}    (numeric TERM id, never a slug, on v3)
 */

/**
 * A WooCommerce product tag presented as a collection.
 *
 * The field list is the storefront's `Collection` verbatim, so kitcommerce-core keeps compiling:
 * dropping fields would be a breaking narrowing of the contract this connector exists to
 * satisfy. A product_tag term only carries id/name/slug/description/count, so the fields it
 * has no column for get the same neutral values the rest of this connector uses for unknowns
 * (`null` / `''` / `false`) — they are never populated with a plausible-looking guess.
 */
export type Collection = {
  id: string
  name: string
  slug: string
  description: string | null
  isActive: boolean
  isFeatured: boolean
  userId: string
  productCount: number
  thumbnail: string | null
  metaTitle: string | null
  metaDescription: string | null
  createdAt: string
  updatedAt: string
}

/** Map a product_tag term into the Collection shape above. */
export function mapWooTag(raw: any): Collection {
  return {
    id: String(raw?.id ?? ''),
    name: String(raw?.name ?? ''),
    slug: String(raw?.slug ?? ''),
    description: raw?.description || null,
    // A term that the API returns exists and is usable; WooCommerce has no per-tag
    // enable/disable switch, and no "featured tag" concept at all.
    isActive: true,
    isFeatured: false,
    // No owner column on a taxonomy term, and terms carry no created/modified date.
    userId: '',
    productCount: Number(raw?.count ?? 0) || 0,
    // Only product CATEGORIES have an `image`; product tags have no image field.
    thumbnail: null,
    metaTitle: null,
    metaDescription: null,
    createdAt: '',
    updatedAt: ''
  }
}

/** The storefront's `-field` sort token -> WooCommerce term orderby/order pair (terms have no date column). */
function wooTagSort(sort?: string): { orderby: string; order: 'asc' | 'desc' } {
  const raw = (sort || '').trim()
  const order: 'asc' | 'desc' = raw.startsWith('-') ? 'desc' : 'asc'
  const map: Record<string, string> = { id: 'id', name: 'name', title: 'name', slug: 'slug', description: 'description', count: 'count', productCount: 'count' }
  const orderby = map[raw.replace(/^-/, '')]
  return orderby ? { orderby, order } : { orderby: 'name', order: 'asc' }
}

/** CollectionService — WooCommerce product tags stand in for collections. */
export class CollectionService extends BaseService {
  private static instance: CollectionService
  static getInstance(): CollectionService { if (!CollectionService.instance) CollectionService.instance = new CollectionService(); return CollectionService.instance }

  /** GET /products/tags?search=&orderby=&order= */
  async list({ page = 1, q = '', sort = '-createdAt' }: { page?: number; q?: string; sort?: string } = {}): Promise<PaginatedResponse<Collection>> {
    const { orderby, order } = wooTagSort(sort)
    const res = await this.getPaged<any>('/products/tags' + this.qs({ page, per_page: PRODUCT_PAGE_SIZE, search: q, orderby, order }))
    return { data: res.data.map(mapWooTag), count: res.total, pageSize: PRODUCT_PAGE_SIZE, noOfPage: res.totalPages, page }
  }

  /** Numeric id -> GET /products/tags/{id}; slug -> GET /products/tags?slug= and take [0]. */
  async getOne(id: string): Promise<Collection> {
    if (/^\d+$/.test(String(id))) return mapWooTag(await this.get<any>('/products/tags/' + id))
    const rows = await this.get<any[]>('/products/tags' + this.qs({ slug: id, per_page: 1 }))
    const raw = Array.isArray(rows) ? rows[0] : rows
    if (!raw || raw.id == null) throw { message: `Collection (product tag) "${id}" was not found.` }
    return mapWooTag(raw)
  }

  /**
   * Products carrying a tag: GET /products?tag={termId}.
   * Additive helper — the contract has no equivalent, but `list()`/`getOne()` are useless
   * without a way to read the tag's products, and this is the documented route.
   */
  async listProducts(id: string, { page = 1 }: { page?: number } = {}): Promise<PaginatedResponse<Product>> {
    const tag = /^\d+$/.test(String(id)) ? String(id) : (await this.getOne(id)).id
    const res = await this.getPaged<any>('/products' + this.qs({ tag, page, per_page: PRODUCT_PAGE_SIZE, status: 'publish' }))
    return {
      data: res.data.map((x) => mapWooProduct(x, { storeId: this.creds.storeId })),
      count: res.total,
      pageSize: PRODUCT_PAGE_SIZE,
      noOfPage: res.totalPages,
      page
    }
  }

  /**
   * PLACEHOLDER — WooCommerce has no aggregate-rating-per-collection endpoint. Ratings
   * live on the product (`average_rating`, `rating_count`); the only aggregate it exposes
   * is store-wide and grouped by star rating (v3 GET /reports/reviews/totals), which is
   * not the same thing, so nothing is invented here.
   */
  async getAllRatings(): Promise<any> { return this.dummy({}) }
}
export const collectionService = CollectionService.getInstance()
