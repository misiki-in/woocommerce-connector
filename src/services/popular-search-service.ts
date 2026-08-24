import type { PaginatedResponse } from '../types'
import { BaseService } from './base.service'

/**
 * PopularSearchService — WooCommerce. Signatures mirror the storefront contract.
 *
 * NOT SUPPORTED: WooCommerce never records the search terms shoppers type. There is no
 * such resource on /wc/v3, on the Store API, or in WordPress core — search analytics only
 * exist inside extensions (e.g. WooCommerce Product Search, Jetpack Search), which a
 * generic connector must not hardcode. The empty page is deliberate; wiring this to any
 * WooCommerce route would mean inventing one.
 */

/** Popular search row — mirrors the storefront contract's PopularSearch. */
export type PopularSearch = {
  id: string
  searchTerm: string
  popularityScore: number
  createdAt: string
  updatedAt: string
}

/** PopularSearchService — placeholder: WooCommerce stores no search-term data. */
export class PopularSearchService extends BaseService {
  private static instance: PopularSearchService
  static getInstance(): PopularSearchService { if (!PopularSearchService.instance) PopularSearchService.instance = new PopularSearchService(); return PopularSearchService.instance }

  /** Always empty — see the class comment: WooCommerce exposes no popular-search endpoint. */
  async listPopularSearch({ page = 1, q = '', sort = '-createdAt' }: { page?: number; q?: string; sort?: string } = {}): Promise<PaginatedResponse<PopularSearch>> {
    void page; void q; void sort
    return this.emptyPage<PopularSearch>()
  }
}
export const popularSearchService = PopularSearchService.getInstance()
