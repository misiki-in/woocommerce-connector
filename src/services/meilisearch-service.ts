import type { Product } from '../types'
import { BaseService } from './base.service'
import { PRODUCT_PAGE_SIZE, mapWooProduct, wooProductSort } from './product-service'

/**
 * MeilisearchService — WooCommerce.
 *
 * IMPORTANT, READ BEFORE USING: Meilisearch is an external search engine that WooCommerce
 * does not run, and there is no /ms/products route in any WooCommerce namespace. Nothing
 * here talks to Meilisearch. This is a DEGRADED, WooCommerce-native substitute built on
 *   GET /wc/v3/products   https://woocommerce.github.io/woocommerce-rest-api-docs/#list-all-products
 * so that callers written against the storefront contract keep working. What that costs:
 *  - no relevance ranking and no `_matchesPosition` (WooCommerce search is a SQL LIKE);
 *  - no `facetDistribution`: v3 returns no facet counts at all. The one faceted surface
 *    WooCommerce has is the Store API's /products/collection-data, which is used below for
 *    the price range only (`allfacetStats.price`);
 *  - `totalHits` comes from the X-WP-Total header, so it is exact, not estimated.
 * Anything this file cannot fill honestly is left undefined rather than faked.
 */

/** Search parameters — mirrors the storefront contract's MsSearchParams. */
export interface MsSearchParams {
  query: string
  categories?: string
  price?: string
  keywords?: string
  tags?: string
  originCountry?: string
  page?: number
  sort?: string
  otherParams?: Record<string, string>
  attributeParams?: Record<string, string>
  optionParams?: Record<string, string>
}

/** Response envelope — mirrors the storefront contract's MeilisearchResponse. */
export type MeilisearchResponse = {
  hits: Product[]
  totalHits?: number
  estimatedTotalHits?: number
  totalPages?: number
  page?: number
  facetDistribution?: Record<string, Record<string, number>>
  facetStats?: Record<string, Record<string, number>>
  limit?: number
  offset?: number
  processingTimeMs: number
  query: string
  allfacetDistribution?: Record<string, Record<string, number>>
  allfacetStats?: Record<string, Record<string, number>>
  categories: Record<string, unknown>[]
}

/** Meilisearch-style `field:asc` / storefront-style `-field` -> WooCommerce orderby+order. */
function normaliseSort(sort?: string): { orderby: string; order: 'asc' | 'desc' } {
  if (sort && sort.includes(':')) {
    const [field, dir] = sort.split(':')
    return wooProductSort(dir === 'desc' ? `-${field}` : field)
  }
  return wooProductSort(sort)
}

/** MeilisearchService — WooCommerce-native fallback for the Meilisearch surface. */
export class MeilisearchService extends BaseService {
  private static instance: MeilisearchService
  static getInstance(): MeilisearchService { if (!MeilisearchService.instance) MeilisearchService.instance = new MeilisearchService(); return MeilisearchService.instance }

  /**
   * Resolve a term slug to the numeric id v3 requires (`category=` / `tag=` never take a
   * slug on v3 — only the Store API does). Returns the raw term row too, so callers can
   * echo the matched category back to the UI.
   */
  protected async resolveTerm(path: '/products/categories' | '/products/tags', slugOrId?: string): Promise<{ id: string; row: any } | null> {
    const value = (slugOrId || '').split(',')[0]?.trim()
    if (!value) return null
    if (/^\d+$/.test(value)) return { id: value, row: { id: Number(value) } }
    const rows = await this.get<any[]>(path + this.qs({ slug: value, per_page: 1 }))
    const row = Array.isArray(rows) ? rows[0] : rows
    return row?.id != null ? { id: String(row.id), row } : null
  }

  /**
   * Price range for the current result set, from the Store API:
   *   GET /wc/store/v1/products/collection-data?calculate_price_range=true
   * https://developer.woocommerce.com/docs/apis/store-api/resources-endpoints/product-collection-data/
   * Store API money is in INTEGER MINOR UNITS, so it is divided by 10^currency_minor_unit
   * before being handed back. Best effort: stores on WooCommerce < 5.9 have no Store API,
   * in which case the price facet is simply omitted.
   */
  protected async priceRange(filters: Record<string, unknown>): Promise<{ min: number; max: number } | undefined> {
    try {
      const res = await this.storeGet<any>('/products/collection-data' + this.qs({ ...filters, calculate_price_range: true }))
      const range = res?.price_range
      if (!range) return undefined
      const unit = Number(range.currency_minor_unit)
      const div = Number.isFinite(unit) && unit > 0 ? Math.pow(10, unit) : 1
      return { min: Number(range.min_price) / div, max: Number(range.max_price) / div }
    } catch {
      return undefined
    }
  }

  /** Translate MsSearchParams into a v3 /products query and run it. */
  async search(params: MsSearchParams): Promise<MeilisearchResponse> {
    const startedAt = Date.now()
    const { query, categories, price, keywords, tags, originCountry, page = 1, sort, otherParams, attributeParams, optionParams } = params

    // WooCommerce v3 has no origin-country filter, and it accepts at most ONE attribute
    // pair (attribute=pa_color&attribute_term=<termId>, term IDs only) — multi-facet
    // filtering needs the Store API's attributes[0][attribute]/[term_id] form. Rather than
    // silently mis-filtering, these parameter groups are ignored here.
    void originCountry; void otherParams; void attributeParams; void optionParams

    // WooCommerce has a single free-text `search`; the contract's separate keyword bag is folded in.
    const search = [query, keywords].filter(Boolean).join(' ').trim()
    const [minPrice = '', maxPrice = ''] = (price || '').split(',')
    const { orderby, order } = normaliseSort(sort)

    const category = await this.resolveTerm('/products/categories', categories)
    const tag = await this.resolveTerm('/products/tags', tags)
    const empty: MeilisearchResponse = { hits: [], totalHits: 0, estimatedTotalHits: 0, totalPages: 0, page, limit: PRODUCT_PAGE_SIZE, processingTimeMs: Date.now() - startedAt, query: search, categories: [] }
    // An unresolvable category/tag slug must narrow to nothing — dropping the filter would
    // silently show the whole catalogue on a category page.
    if ((categories && !category) || (tags && !tag)) return empty

    const filters = {
      search,
      category: category?.id,
      tag: tag?.id,
      min_price: minPrice,
      max_price: maxPrice,
      status: 'publish'
    }
    const res = await this.getPaged<any>('/products' + this.qs({ ...filters, page, per_page: PRODUCT_PAGE_SIZE, orderby, order }))
    const stats = await this.priceRange({ search, category: category?.id, tag: tag?.id })

    return {
      hits: res.data.map((x) => mapWooProduct(x, { storeId: this.creds.storeId })),
      totalHits: res.total,
      estimatedTotalHits: res.total,
      totalPages: res.totalPages,
      page,
      limit: PRODUCT_PAGE_SIZE,
      offset: (page - 1) * PRODUCT_PAGE_SIZE,
      processingTimeMs: Date.now() - startedAt,
      query: search,
      // The one facet WooCommerce can produce. facetDistribution stays undefined.
      allfacetStats: stats ? { price: stats } : undefined,
      // Not a hierarchy: v3 returns no category facet, so this echoes the matched term only.
      categories: category?.row ? [category.row as Record<string, unknown>] : []
    }
  }

  /** Typeahead: the same /products search capped at 10 rows. WooCommerce has no suggest endpoint. */
  async searchAutoComplete(params: { query: string }): Promise<MeilisearchResponse> {
    const startedAt = Date.now()
    const search = params?.query || ''
    const res = await this.getPaged<any>('/products' + this.qs({ search, page: 1, per_page: 10, orderby: 'popularity', order: 'desc', status: 'publish' }))
    return {
      hits: res.data.map((x) => mapWooProduct(x, { storeId: this.creds.storeId })),
      totalHits: res.total,
      estimatedTotalHits: res.total,
      totalPages: res.totalPages,
      page: 1,
      limit: 10,
      processingTimeMs: Date.now() - startedAt,
      query: search,
      categories: []
    }
  }
}
export const meilisearchService = MeilisearchService.getInstance()
