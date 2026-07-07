import { BaseService } from './base.service'
import { EP } from '../endpoints'

export class OrderService extends BaseService {
  list(opts: { page?: number; perPage?: number; search?: string } = {}) {
    if (!EP.orders) return this.unsupported('order.list')
    return this.listAt(EP.orders, opts)
  }
  listOrdersByParent(opts: { page?: number; perPage?: number; search?: string } = {}) {
    if (!EP.orders) return this.unsupported('order.listOrdersByParent')
    return this.listAt(EP.orders, opts)
  }
  fetchOrder(id: string | number) {
    if (!EP.orders) return this.unsupported('order.fetchOrder')
    return this.get(`${EP.orders}/${id}`)
  }
  getOrder(orderNo: string | number) {
    if (!EP.orders) return this.unsupported('order.getOrder')
    return this.get(`${EP.orders}/${orderNo}`)
  }
  fetchTrackOrder(id: string | number) {
    if (!EP.orders) return this.unsupported('order.fetchTrackOrder')
    return this.get(`${EP.orders}/${id}`)
  }
  create(data: Record<string, unknown>) {
    if (!EP.orders) return this.unsupported('order.create')
    return this.post(EP.orders, data)
  }
  update(id: string | number, data: Record<string, unknown>) {
    if (!EP.orders) return this.unsupported('order.update')
    return this.put(`${EP.orders}/${id}`, data)
  }
  listPublic() { return this.unsupported('order.listPublic') }
  buyAgain() { return this.unsupported('order.buyAgain') }
  paySuccessPageHit(orderId: string) { void orderId; return this.unsupported('order.paySuccessPageHit') }
  getOrderByEmailAndOTP(data: Record<string, unknown>) { void data; return this.unsupported('order.getOrderByEmailAndOTP') }
  submitReview(data: Record<string, unknown>) {
    if (!EP.reviews) return this.unsupported('order.submitReview')
    return this.post(EP.reviews, data)
  }
  codCheckout(data: Record<string, unknown>) { void data; return this.unsupported('order.codCheckout') }
  razorpayCheckout(data: Record<string, unknown>) { void data; return this.unsupported('order.razorpayCheckout') }
  stripeCheckout(data: Record<string, unknown>) { void data; return this.unsupported('order.stripeCheckout') }
  cashfreeCheckout(data: Record<string, unknown>) { void data; return this.unsupported('order.cashfreeCheckout') }
  razorCapture(data: Record<string, unknown>) { void data; return this.unsupported('order.razorCapture') }
}
