import type { PaginatedResponse } from '../types'
import { BaseService } from './base.service'

/**
 * WishlistService — WooCommerce. Signatures mirror @misiki/litekart-connector.
 *
 * ALL METHODS ARE PLACEHOLDERS. WooCommerce has no wishlist anywhere: not in
 * /wp-json/wc/v3, not in the Store API (/wp-json/wc/store/v1) and not in WP core
 * (/wp-json/wp/v2). Wishlists come from plugins (YITH, TI Wishlist) that register their
 * own namespaces and are not guaranteed to be installed, so nothing is hardcoded here —
 * a made-up path would 404 in a real customer's store.
 *
 * The supported pattern for a storefront is to keep the product ids client-side
 * (localStorage) and hydrate them with `productService` / GET /products?include=1,2,3.
 * Persisting wishlist state into customer meta_data (PUT /customers/{id}) is technically
 * possible but is an unadvertised convention no other consumer of the store understands,
 * so it is deliberately not done.
 */
export class WishlistService extends BaseService {
  private static instance: WishlistService
  static getInstance(): WishlistService { if (!WishlistService.instance) WishlistService.instance = new WishlistService(); return WishlistService.instance }

  /** PLACEHOLDER: no server-side wishlist collection exists in WooCommerce. */
  async fetchWishlist({ q = '', sort = '', page = 1 }: { q?: string; sort?: string; page?: number } = {}): Promise<PaginatedResponse<any>> {
    void q; void sort; void page
    return this.emptyPage()
  }

  /** PLACEHOLDER: nothing server-side to check against; always reports "not wishlisted". */
  async checkWishlist({ productId, variantId }: { productId: string; variantId: string }): Promise<boolean> {
    void productId; void variantId
    return this.dummy(false)
  }

  /** PLACEHOLDER: same as checkWishlist, echoed back per id so the shape is still correct. */
  async checkWishlistInBulk(ids: { productId: string; variantId: string }[]): Promise<{ productId: string; variantId: string; exists: boolean }[]> {
    return this.dummy((ids || []).map((i) => ({ productId: i.productId, variantId: i.variantId, exists: false })))
  }

  /** PLACEHOLDER: no-op. There is no WooCommerce endpoint to write wishlist state to. */
  async toggleWishlist({ productId, variantId }: { productId: string; variantId: string }): Promise<any> {
    void productId; void variantId
    return this.dummy({})
  }
}

export const wishlistService = WishlistService.getInstance()
