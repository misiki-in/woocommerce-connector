import { BaseService } from './base.service'
/** OrderService — present-but-dummy (mirrors litekart-connector); returns dummy data, never throws. */
export class OrderService extends BaseService {
  private static instance: OrderService
  static getInstance(): OrderService { if (!OrderService.instance) OrderService.instance = new OrderService(); return OrderService.instance }
  async list(..._args: any[]): Promise<any> { return this.emptyPage() }
  async listOrdersByParent(..._args: any[]): Promise<any> { return this.emptyPage() }
  async fetchOrder(..._args: any[]): Promise<any> { return this.dummy({}) }
  async getOrder(..._args: any[]): Promise<any> { return this.dummy({}) }
  async fetchTrackOrder(..._args: any[]): Promise<any> { return this.dummy({}) }
  async paySuccessPageHit(..._args: any[]): Promise<any> { return this.dummy({}) }
  async codCheckout(..._args: any[]): Promise<any> { return this.dummy({}) }
  async cashfreeCheckout(..._args: any[]): Promise<any> { return this.dummy({}) }
  async razorpayCheckout(..._args: any[]): Promise<any> { return this.dummy({}) }
  async stripeCheckout(..._args: any[]): Promise<any> { return this.dummy({}) }
  async razorCapture(..._args: any[]): Promise<any> { return this.dummy({}) }
  async listPublic(..._args: any[]): Promise<any> { return this.emptyPage() }
  async getOrderByEmailAndOTP(..._args: any[]): Promise<any> { return this.dummy({}) }
  async buyAgain(..._args: any[]): Promise<any> { return this.dummy({}) }
  async submitReview(..._args: any[]): Promise<any> { return this.dummy({}) }
}
export const orderService = OrderService.getInstance()
