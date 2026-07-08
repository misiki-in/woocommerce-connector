import { BaseService } from './base.service'
/** PaymentMethodService — present-but-dummy (mirrors litekart-connector); returns dummy data, never throws. */
export class PaymentMethodService extends BaseService {
  private static instance: PaymentMethodService
  static getInstance(): PaymentMethodService { if (!PaymentMethodService.instance) PaymentMethodService.instance = new PaymentMethodService(); return PaymentMethodService.instance }
  async list(..._args: any[]): Promise<any> { return this.emptyPage() }
}
export const paymentMethodService = PaymentMethodService.getInstance()
