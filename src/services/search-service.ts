<<<<<<< HEAD
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
=======
import { ProductSearchResult } from '../types/product-search.js'
import { BaseService } from './base-service.js'
import { transformWooCommerceProduct } from './product-service.js'

/**
 * SearchService provides product search functionality using the WooCommerce REST API.
 */
export class SearchService extends BaseService {
    private static instance: SearchService

    static getInstance(): SearchService {
        if (!SearchService.instance) {
            SearchService.instance = new SearchService()
        }
        return SearchService.instance
    }

    /**
     * Performs a product search using URL search parameters
     *
     * @param {URL} url - The URL containing search parameters
     * @param {string} [slug] - Optional category slug
     * @returns {Promise<ProductSearchResult>} Structured search results
     */
    async searchWithUrl(url: URL, slug?: string): Promise<ProductSearchResult> {
        try {
            const searchParams = new URLSearchParams(url.search)

            const query = searchParams.get('search') || ''
            const categoriesSlug = slug || searchParams.get('categories') || ''
            const tagsSlug = searchParams.get('tags') || ''
            const page = Number(searchParams.get('page') || 1)
            const sort = searchParams.get('sort') || ''
            const min_price = searchParams.get('priceFrom') || ''
            const max_price = searchParams.get('priceTo') || ''

            const params: any = {
                page,
                per_page: 20, // default page size
                status: 'publish'
            }

            if (query) params.search = query
            if (min_price) params.min_price = min_price
            if (max_price) params.max_price = max_price

            // Handle sorting mapping if needed
            if (sort) {
                if (sort.includes('price')) {
                    params.orderby = 'price'
                    params.order = sort.includes('desc') ? 'desc' : 'asc'
                } else if (sort.includes('date')) {
                    params.orderby = 'date'
                }
            }

            // Note: WooCommerce API expects category/tag IDs, not slugs.
            // For a full implementation, we'd need to resolve slugs to IDs first.
            // As a simplified version for this connector, we'll try to find categories if slug provided.
            // Store API expects category IDs, not slugs.
            if (categoriesSlug) {
                try {
                    const categoriesRes = await this.get<any[]>('/wp-json/wc/store/v1/products/categories', { per_page: 100 })
                    const cat = categoriesRes.find((c: any) => c.slug === categoriesSlug)
                    if (cat) {
                        params.category = cat.id
                    }
                } catch (e) {
                    console.error('Error resolving category slug:', e)
                }
            }

            if (tagsSlug) {
                // Store API might not support tag slug filtering directly, similar to categories
                // For simplicity, we'll skip tag filtering or use search if needed
            }

            const res = await this.get<any[]>('/wp-json/wc/store/v1/products', params)

            return {
                data: res.map(transformWooCommerceProduct),
                count: res.length,
                totalPages: 1, // Need headers for exact count
                categoryHierarchy: [],
                facets: {
                    priceStat: { min: undefined, max: undefined },
                    categories: [],
                    tags: [],
                    allFilters: {}
                }
            }
        } catch (error) {
            console.error('Search error:', error)
            return this.emptyResult()
        }
    }

    /**
     * Search with a simple query string
     */
    async searchWithQuery(query: string): Promise<ProductSearchResult> {
        // Construct a dummy URL with the search param
        const url = new URL('http://localhost')
        if (query) url.searchParams.set('search', query)
        return this.searchWithUrl(url)
    }

    /**
     * Returns an empty search result
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

>>>>>>> f348a1b (feat: product listing)
export const searchService = SearchService.getInstance()
