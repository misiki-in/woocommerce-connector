import { BaseService } from './base.service'

export class CheckoutService extends BaseService {
  getShippingRates(data: Record<string, unknown>) { void data; return this.unsupported('checkout.getShippingRates') }
  checkoutCOD(data: Record<string, unknown>) { void data; return this.unsupported('checkout.checkoutCOD') }
  checkoutPOS(data: Record<string, unknown>) { void data; return this.unsupported('checkout.checkoutPOS') }
  checkoutRazorpay(data: Record<string, unknown>) { void data; return this.unsupported('checkout.checkoutRazorpay') }
  captureRazorpayPayment(data: Record<string, unknown>) { void data; return this.unsupported('checkout.captureRazorpayPayment') }
  checkoutPhonepe(data: Record<string, unknown>) { void data; return this.unsupported('checkout.checkoutPhonepe') }
  capturePhonepePayment(data: Record<string, unknown>) { void data; return this.unsupported('checkout.capturePhonepePayment') }
  checkoutPaypal(data: Record<string, unknown>) { void data; return this.unsupported('checkout.checkoutPaypal') }
  checkoutStripe(data: Record<string, unknown>) { void data; return this.unsupported('checkout.checkoutStripe') }
  checkoutStripeCapture(data: Record<string, unknown>) { void data; return this.unsupported('checkout.checkoutStripeCapture') }
  checkoutCashfree(data: Record<string, unknown>) { void data; return this.unsupported('checkout.checkoutCashfree') }
  captureCashfreePayment(data: Record<string, unknown>) { void data; return this.unsupported('checkout.captureCashfreePayment') }
  createAffirmPayOrder(data: Record<string, unknown>) { void data; return this.unsupported('checkout.createAffirmPayOrder') }
  cancelAffirmOrder(data: Record<string, unknown>) { void data; return this.unsupported('checkout.cancelAffirmOrder') }
  confirmAffirmOrder(data: Record<string, unknown>) { void data; return this.unsupported('checkout.confirmAffirmOrder') }
}
