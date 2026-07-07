import { BaseService } from './base.service'
import { EP } from '../endpoints'

export class CartService extends BaseService {
  fetchCartData() {
    if (!EP.cart) return this.unsupported('cart.fetchCartData')
    return this.get(EP.cart)
  }
  refereshCart() {
    if (!EP.cart) return this.unsupported('cart.refereshCart')
    return this.get(EP.cart)
  }
  getCartByCartId(cartId: string) {
    if (!EP.cart) return this.unsupported('cart.getCartByCartId')
    return this.get(`${EP.cart}/${cartId}`)
  }
  addToCart(data: Record<string, unknown>) {
    if (!EP.cart) return this.unsupported('cart.addToCart')
    return this.post(EP.cart, data)
  }
  removeCart(data: Record<string, unknown>) {
    if (!EP.cart) return this.unsupported('cart.removeCart')
    return this.post(`${EP.cart}/remove`, data)
  }
  applyCoupon(data: Record<string, unknown>) { void data; return this.unsupported('cart.applyCoupon') }
  removeCoupon() { return this.unsupported('cart.removeCoupon') }
  updateCart(data: Record<string, unknown>) {
    if (!EP.cart) return this.unsupported('cart.updateCart')
    return this.post(`${EP.cart}/update`, data)
  }
  updateCart2(data: Record<string, unknown>) { void data; return this.unsupported('cart.updateCart2') }
  completeCart(cartId: string) { void cartId; return this.unsupported('cart.completeCart') }
  updateShippingRate(data: Record<string, unknown>) { void data; return this.unsupported('cart.updateShippingRate') }
}
