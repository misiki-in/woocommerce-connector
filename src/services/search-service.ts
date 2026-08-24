import type { Product } from '../types'
import { BaseService } from './base.service'
import { MeilisearchService } from './meilisearch-service'

/**
 * SearchService — WooCommerce. Signatures mirror the storefront contract.
 *
 * Same layering as the storefront contract: this service parses the storefront URL and delegates the
 * actual query to MeilisearchService — which, in this connector, is a WooCommerce-native
 * fallback over v3 GET /products (see meilisearch-service.ts for exactly what that costs).
 * URL parameter translation:
 *   search -> search, categories -> category (slug resolved to a term id, v3 needs ids),
 *   tags -> tag (same), priceFrom/priceTo -> min_price/max_price, page -> page,
 *   sort -> orderby + order.
 * Facet counts are not available on v3; only the price range is, via the Store API's
 * /products/collection-data.
 */

/** Structured search results — mirrors the storefront contract's ProductSearchResult. */
export interface ProductSearchResult {
  data: Product[]
  count: number
  totalPages: number
  categoryHierarchy: Record<string, any>[]
  facets: {
    priceStat: { min?: number; max?: number }
    categories: { name: string; count: number }[]
    tags: { name: string; count: number }[]
    allFilters?: Record<string, Record<string, number>>
  }
}

/** SearchService — WooCommerce. Signatures mirror the storefront contract. */
export class SearchService extends BaseService {
  private static instance: SearchService
  private meilisearchService: MeilisearchService

  constructor(fetchFn?: typeof fetch) {
    super(fetchFn)
    this.meilisearchService = new MeilisearchService(fetchFn)
  }

  static getInstance(): SearchService { if (!SearchService.instance) SearchService.instance = new SearchService(); return SearchService.instance }

  /** Shape a search response into the ProductSearchResult contract. */
  private toResult(res: Awaited<ReturnType<MeilisearchService['search']>>): ProductSearchResult {
    return {
      data: res?.hits || [],
      count: res?.totalHits || res?.estimatedTotalHits || 0,
      totalPages: res?.totalPages || 0,
      categoryHierarchy: res?.categories || [],
      facets: {
        // Price comes from the Store API collection-data call. WooCommerce v3 returns no
        // category/tag facet counts, so `facetDistribution` is undefined today and both lists
        // come out empty — but the mapping is the storefront's, verbatim, rather than a hardcoded
        // `[]`, so wiring facetDistribution up later needs no change here.
        priceStat: {
          min: res?.allfacetStats?.price?.min,
          max: res?.allfacetStats?.price?.max
        },
        categories: Object.entries(res?.facetDistribution?.['categories.category.slug'] || {}).map(([name, count]) => ({ name, count })),
        tags: Object.entries(res?.facetDistribution?.['tags.name'] || {}).map(([name, count]) => ({ name, count })),
        allFilters: res?.facetDistribution
      }
    }
  }

  /**
   * Search from a storefront URL. `slug` (a category handle) overrides ?categories=.
   * Mirrors the storefront's parameter parsing, including its swallow-and-return-empty contract.
   */
  async searchWithUrl(url: URL, slug?: string): Promise<ProductSearchResult> {
    try {
      const searchParams = new URLSearchParams(url.search)
      const standardParams = {
        query: searchParams.get('search') || '',
        categories: slug || searchParams.get('categories') || '',
        tags: searchParams.get('tags') || '',
        originCountry: searchParams.get('originCountry') || '',
        keywords: searchParams.get('keywords') || '',
        page: Number(searchParams.get('page') || 1),
        sort: searchParams.get('sort') || ''
      }

      const price =
        searchParams.get('priceFrom') || searchParams.get('priceTo')
          ? `${searchParams.get('priceFrom') || ''},${searchParams.get('priceTo') || ''}`
          : ''

      const reservedParams = ['search', 'categories', 'priceFrom', 'priceTo', 'tags', 'originCountry', 'keywords', 'page', 'sort']

      const attributeParams: Record<string, string> = {}
      const optionParams: Record<string, string> = {}
      const otherParams: Record<string, string> = {}

      for (const key of [...searchParams.keys()]) {
        if (!reservedParams.includes(key)) {
          const value = searchParams.get(key) || ''
          if (key.startsWith('attributes.')) attributeParams[key] = value
          else if (key.startsWith('option.')) optionParams[key] = value
          else otherParams[key] = value
        }
      }

      const res = await this.meilisearchService.search({ ...standardParams, price, otherParams, attributeParams, optionParams })
      return this.toResult(res)
    } catch (error) {
      console.error(error)
      return this.emptyResult()
    }
  }

  /** Plain text search: GET /products?search={query} behind the MeilisearchService facade. */
  async searchWithQuery(query: string): Promise<ProductSearchResult> {
    try {
      const res = await this.meilisearchService.search({ query: query || '' })
      return this.toResult(res)
    } catch (error) {
      console.error(error)
      return this.emptyResult()
    }
  }

  /** Empty result used as the failure fallback (additive: the contract has no such method). */
  emptyResult(): ProductSearchResult {
    return {
      data: [],
      count: 0,
      totalPages: 0,
      categoryHierarchy: [],
      facets: { priceStat: { min: undefined, max: undefined }, categories: [], tags: [], allFilters: {} }
    }
  }
}
export const searchService = SearchService.getInstance()
