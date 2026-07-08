import { BaseService } from './base.service'
/** WishlistService — present-but-dummy (mirrors litekart-connector); returns dummy data, never throws. */
export class WishlistService extends BaseService {
  private static instance: WishlistService
  static getInstance(): WishlistService { if (!WishlistService.instance) WishlistService.instance = new WishlistService(); return WishlistService.instance }
  async fetchWishlist(..._args: any[]): Promise<any> { return this.dummy({}) }
  async checkWishlist(..._args: any[]): Promise<any> { return this.dummy({}) }
  async checkWishlistInBulk(..._args: any[]): Promise<any> { return this.dummy({}) }
  async toggleWishlist(..._args: any[]): Promise<any> { return this.dummy({}) }
}
export const wishlistService = WishlistService.getInstance()
