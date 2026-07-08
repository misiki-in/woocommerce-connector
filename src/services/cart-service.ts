import { BaseService } from './base.service'
/** CartService — present-but-dummy (mirrors litekart-connector); returns dummy data, never throws. */
export class CartService extends BaseService {
  private static instance: CartService
  static getInstance(): CartService { if (!CartService.instance) CartService.instance = new CartService(); return CartService.instance }
  async fetchCartData(..._args: any[]): Promise<any> { return this.dummy({}) }
  async refereshCart(..._args: any[]): Promise<any> { return this.dummy({}) }
  async getCartByCartId(..._args: any[]): Promise<any> { return this.dummy({}) }
  async addToCart(..._args: any[]): Promise<any> { return this.dummy({}) }
  async removeCart(..._args: any[]): Promise<any> { return this.dummy({}) }
  async applyCoupon(..._args: any[]): Promise<any> { return this.dummy({}) }
  async removeCoupon(..._args: any[]): Promise<any> { return this.dummy({}) }
  async updateCart2(..._args: any[]): Promise<any> { return this.dummy({}) }
  async completeCart(..._args: any[]): Promise<any> { return this.dummy({}) }
  async updateCart(..._args: any[]): Promise<any> { return this.dummy({}) }
  async updateShippingRate(..._args: any[]): Promise<any> { return this.dummy({}) }
}
export const cartService = CartService.getInstance()
