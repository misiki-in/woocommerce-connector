import type { Product } from './product-types'

/**
 * Interface for page metadata information
 */
export interface PageMetadata {
	metaDescription?: string
	metaKeywords?: string
	logo?: string
}

/**
 * Search parameters for Meilisearch queries
 */
export interface MsSearchParams {
	query: string
	categories?: string
	price?: string
	keywords?: string
	tags?: string
	originCountry?: string
	page?: number
	sort?: string
	// Regular additional parameters
	otherParams?: Record<string, string>
	// Dynamic attribute parameters (attributes.*)
	attributeParams?: Record<string, string>
	// Dynamic option parameters (option.*)
	optionParams?: Record<string, string>
}

/**
 * Response type from Meilisearch API
 */
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

/**
 * Structured product search results for UI consumption
 */
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

/**
 * Complete page data structure for product pages
 */
export interface PageData {
	products: ProductSearchResult
	page?: PageMetadata
}
