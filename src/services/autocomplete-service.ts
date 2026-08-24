import type { PaginatedResponse } from '../types'
import { BaseService } from './base.service'
import { wooProductSort } from './product-service'

/**
 * AutocompleteService — WooCommerce. Signatures mirror the storefront contract.
 *
 * WooCommerce ships no suggest/typeahead resource, so the closest real endpoint is a small
 * product search: GET /products?search=&per_page=10
 * https://woocommerce.github.io/woocommerce-rest-api-docs/#list-all-products
 * `search_fields` (name, sku, global_unique_id, description, short_description) narrows
 * what is matched, and `_fields` is the WP-REST-global response filter — both are documented
 * v3 params and both are ignored harmlessly by older WooCommerce versions.
 */

/** Suggestion row — mirrors the storefront contract's AutoComplete (`slug`/`link` are additive). */
export type AutoComplete = {
  id: string
  text: string
  type: string
  popularity: number
  slug: string | null
  link: string | null
  createdAt: string
  updatedAt: string
}

/** Default number of suggestions. */
const SUGGESTION_LIMIT = 10

/** AutocompleteService — WooCommerce product name/SKU typeahead. */
export class AutocompleteService extends BaseService {
  private static instance: AutocompleteService
  static getInstance(): AutocompleteService { if (!AutocompleteService.instance) AutocompleteService.instance = new AutocompleteService(); return AutocompleteService.instance }

  /**
   * GET /products?search={q}&per_page=10&orderby=popularity — most-sold matches first
   * (WooCommerce's `popularity` orderby is total_sales).
   */
  async list({ page = 1, q = '', sort = '-createdAt' }: { page?: number; q?: string; sort?: string } = {}): Promise<PaginatedResponse<AutoComplete>> {
    // Default ordering for a typeahead is popularity, not recency; an explicit sort wins.
    const { orderby, order } = sort && sort !== '-createdAt' ? wooProductSort(sort) : { orderby: 'popularity', order: 'desc' as const }
    const res = await this.getPaged<any>(
      '/products' +
        this.qs({
          search: q,
          search_fields: 'name,sku',
          page,
          per_page: SUGGESTION_LIMIT,
          orderby,
          order,
          status: 'publish',
          _fields: 'id,name,slug,permalink,total_sales,date_created,date_modified'
        })
    )
    const data: AutoComplete[] = res.data.map((x: any) => ({
      id: String(x?.id ?? ''),
      text: String(x?.name ?? ''),
      type: 'product',
      popularity: Number(x?.total_sales ?? 0) || 0,
      slug: x?.slug ?? null,
      link: x?.permalink ?? null,
      createdAt: String(x?.date_created ?? ''),
      updatedAt: String(x?.date_modified ?? '')
    }))
    return { data, count: res.total, pageSize: SUGGESTION_LIMIT, noOfPage: res.totalPages, page }
  }
}
export const autocompleteService = AutocompleteService.getInstance()
