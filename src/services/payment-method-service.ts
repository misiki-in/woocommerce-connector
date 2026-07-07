import { BaseService } from './base.service'
import { EP } from '../endpoints'

export class PaymentMethodService extends BaseService {
  list(opts: { page?: number; perPage?: number; search?: string } = {}) {
    if (!EP.paymentMethods) return this.unsupported('paymentMethod.list')
    return this.listAt(EP.paymentMethods, opts)
  }
}
