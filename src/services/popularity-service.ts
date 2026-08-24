import { BaseService } from './base.service'

/**
 * PopularityService — WooCommerce. Signatures mirror the storefront contract
 * (whose own updatePopularity is a no-op too).
 *
 * NOT SUPPORTED: popularity in WooCommerce is `total_sales` (plus `average_rating` /
 * `rating_count`). All three are read-only fields that WooCommerce computes from real
 * orders and reviews — there is no increment/track endpoint on /wc/v3, the Store API or WP
 * core. You can SORT by it (GET /products?orderby=popularity) but you cannot write it, and
 * writing a synthetic counter into `meta_data` would corrupt the store's own sorting and
 * reports. So this stays a no-op instead of being pointed at a plausible-looking route.
 */
export class PopularityService extends BaseService {
  private static instance: PopularityService
  static getInstance(): PopularityService { if (!PopularityService.instance) PopularityService.instance = new PopularityService(); return PopularityService.instance }

  /** No-op: WooCommerce has no writable popularity metric (see the class comment). */
  async updatePopularity({ product_id, sid = null }: { product_id: string; sid?: string | null }): Promise<void> {
    void product_id; void sid
  }
}
export const popularityService = PopularityService.getInstance()
