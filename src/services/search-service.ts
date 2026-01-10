import { orderFromSort } from "../config"
import { ProductSearchResult } from "../types/product-search"
import { BaseService } from "./base-service"
import { transformProduct } from "./product-service"

function getOrderbFromSort(value: string): string {
  const arr = value?.split(':')
  console.log(value, arr)
  if (!(arr[0] in orderFromSort)) return ''
  return (arr[1] == 'desc' ? '-' : '') + orderFromSort[arr[0]]
}

/**
 * SearchService provides a high-level API for product search operations
 * by leveraging the underlying Meilisearch implementation.
 *
 * This service helps with:
 * - Converting URL search parameters into Meilisearch queries
 * - Processing and formatting search results into a consistent format
 * - Handling search-related errors with fallback values
 */
export class SearchService extends BaseService {
  private static instance: SearchService

  /**
   * Get the singleton instance
   *
   * @returns {SearchService} The singleton instance of SearchService
   */
  static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService()
    }
    return SearchService.instance
  }

  /**
   * Performs a product search using URL search parameters
   *
   * This method parses URL search parameters and organizes them into different types
   * (standard, attribute-based, option-based, etc.) before executing the search.
   *
   * @param {URL} url - The URL containing search parameters in its query string
   * @param {string} [slug] - Optional category slug that overrides the one in URL params
   * @returns {Promise<ProductSearchResult>} Structured search results with products and facets
   * @api {get} /api/ms/products Search products using URL parameters
   *
   * @example
   * // Search using a URL with multiple parameters
   * const searchUrl = new URL('https://example.com/search?search=shoes&categories=footwear&priceFrom=50&priceTo=200');
   * const results = await searchService.searchWithUrl(searchUrl);
   */
  async searchWithUrl(url: URL, slug?: string) {
    try {
      const searchParams = new URLSearchParams(url.search)
      /*

      // Standard search parameters with default values
      const standardParams = {
        query: searchParams.get('search') || '',
        categories: slug || searchParams.get('categories') || '',
        tags: searchParams.get('tags') || '',
        originCountry: searchParams.get('originCountry') || '',
        keywords: searchParams.get('keywords') || '',
        page: Number(searchParams.get('page') || 1),
        sort: searchParams.get('sort') || ''
      }

      // Handle price range specially
      const price =
        searchParams.get('priceFrom') || searchParams.get('priceTo')
          ? `${searchParams.get('priceFrom') || ''},${
              searchParams.get('priceTo') || ''
            }`
          : ''

      // Reserved parameter names that shouldn't be included in the dynamic params
      const reservedParams = [
        'search',
        'categories',
        'priceFrom',
        'priceTo',
        'tags',
        'originCountry',
        'keywords',
        'page',
        'sort'
      ]

      // Dynamic parameters sorted by type
      const attributeParams: Record<string, string> = {}
      const optionParams: Record<string, string> = {}
      const otherParams: Record<string, string> = {}

      // Process all non-reserved parameters
      for (const key of [...searchParams.keys()]) {
        if (!reservedParams.includes(key)) {
          const value = searchParams.get(key) || ''

          if (key.startsWith('attributes.')) {
            attributeParams[key] = value
          } else if (key.startsWith('option.')) {
            optionParams[key] = value
          } else {
            otherParams[key] = value
          }
        }
      }
      */

      const newSearchParams = new URLSearchParams()
      newSearchParams.set('fields', '+variants.calculated_price')
      newSearchParams.set('region_id', BaseService.getRegionId())
      const order = getOrderbFromSort(searchParams.get('sort') || '')
      if (order)
        newSearchParams.set('order', order)
      newSearchParams.set('q', searchParams.get('q') || "")

      if (slug)
        newSearchParams.set('category_id', slug)

      const res = await this.get<any>(`/store/products?` + newSearchParams.toString())

      return {
        data: (res?.products || []).map(transformProduct),
        count: res?.count || res?.totalHits || res?.estimatedTotalHits || 0,
        totalPages: res?.totalPages || 0,
        categoryHierarchy: res?.categories || [],
        categories: res?.categories || [],
        facets: {
          priceStat: {
            //min: res?.allfacetStats?.price?.min,
            //max: res?.allfacetStats?.price?.max
          },
          categories: [],
          tags: [],
          allFilters: {},
        },
      }
    } catch (error) {
      console.error(error)
      // Return a valid empty result object that matches the expected type
      return this.emptyResult()
    }
  }

  /**
   * Search through Meilisearch with a simple query string
   *
   * This method is useful for basic search scenarios like autocomplete, search bars,
   * and quick lookups where only a text query is needed.
   *
   * @param {string} query - The search query string
   * @returns {Promise<ProductSearchResult>} Structured search results with products and facets
   * @api {get} /api/ms/products?search={query} Search products with query string
   *
   * @example
   * // Simple search for "red shoes"
   * const results = await searchService.searchWithQuery("red shoes");
   */
  async searchWithQuery(query: string) {
    try {
      const newSearchParams = new URLSearchParams()
      newSearchParams.set('fields', '+variants.calculated_price')
      newSearchParams.set('region_id', BaseService.getRegionId())
      newSearchParams.set('q', query)
      const res = await this.get<any>(`/store/products?` + newSearchParams.toString())

            return {
        data: (res?.products || []).map(transformProduct),
        count: res?.count || res?.totalHits || res?.estimatedTotalHits || 0,
        totalPages: res?.totalPages || 0,
        categoryHierarchy: res?.categories || [],
        categories: res?.categories || [],
        facets: {
          priceStat: {
            //min: res?.allfacetStats?.price?.min,
            //max: res?.allfacetStats?.price?.max
          },
          categories: [],
          tags: [],
          allFilters: {},
        },
      }
    } catch (error) {
      console.error(error)
      // Return a valid empty result object
      return this.emptyResult()
    }
  }

  /**
   * Create an empty product search result
   *
   * This method is used internally for error handling and as a fallback
   * when search operations fail.
   *
   * @returns {ProductSearchResult} Empty result object with default values
   */
  emptyResult(): ProductSearchResult {
    return {
      data: [],
      count: 0,
      totalPages: 0,
      categoryHierarchy: [],
      facets: {
        priceStat: { min: undefined, max: undefined },
        categories: [],
        tags: [],
        allFilters: {}
      }
    }
  }
}

// Use singleton instance
export const searchService = SearchService.getInstance()
