import { BaseService } from './base.service'
import { EP } from '../endpoints'

export class WishlistService extends BaseService {
  fetchWishlist(opts: { page?: number; perPage?: number; search?: string } = {}) {
    if (!EP.wishlist) return this.unsupported('wishlist.fetchWishlist')
    return this.listAt(EP.wishlist, opts)
  }
  checkWishlist(id: string | number) {
    if (!EP.wishlist) return this.unsupported('wishlist.checkWishlist')
    return this.get(`${EP.wishlist}/${id}`)
  }
  checkWishlistInBulk(ids: Array<string | number>) { void ids; return this.unsupported('wishlist.checkWishlistInBulk') }
  toggleWishlist(data: Record<string, unknown>) {
    if (!EP.wishlist) return this.unsupported('wishlist.toggleWishlist')
    return this.post(EP.wishlist, data)
  }
}
