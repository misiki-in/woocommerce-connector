import { BaseService } from './base.service'
/** CheckoutService — present-but-dummy (mirrors litekart-connector); returns dummy data, never throws. */
export class CheckoutService extends BaseService {
  private static instance: CheckoutService
  static getInstance(): CheckoutService { if (!CheckoutService.instance) CheckoutService.instance = new CheckoutService(); return CheckoutService.instance }
  async checkoutRazorpay(..._args: any[]): Promise<any> { return this.dummy({}) }
  async checkoutCOD(..._args: any[]): Promise<any> { return this.dummy({}) }
  async checkoutPOS(..._args: any[]): Promise<any> { return this.dummy({}) }
  async captureRazorpayPayment(..._args: any[]): Promise<any> { return this.dummy({}) }
  async checkoutPhonepe(..._args: any[]): Promise<any> { return this.dummy({}) }
  async getShippingRates(..._args: any[]): Promise<any> { return this.dummy({}) }
  async capturePhonepePayment(..._args: any[]): Promise<any> { return this.dummy({}) }
  async checkoutPaypal(..._args: any[]): Promise<any> { return this.dummy({}) }
  async checkoutStripe(..._args: any[]): Promise<any> { return this.dummy({}) }
  async checkoutStripeCapture(..._args: any[]): Promise<any> { return this.dummy({}) }
  async checkoutCashfree(..._args: any[]): Promise<any> { return this.dummy({}) }
  async captureCashfreePayment(..._args: any[]): Promise<any> { return this.dummy({}) }
  async createAffirmPayOrder(..._args: any[]): Promise<any> { return this.dummy({}) }
  async cancelAffirmOrder(..._args: any[]): Promise<any> { return this.dummy({}) }
  async confirmAffirmOrder(..._args: any[]): Promise<any> { return this.dummy({}) }
}
export const checkoutService = CheckoutService.getInstance()
