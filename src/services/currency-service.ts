import { BaseService } from './base.service'
import { EP } from '../endpoints'

export class CurrencyService extends BaseService {
  listCurrencies(opts: { page?: number; perPage?: number; search?: string } = {}) {
    if (!EP.currencies) return this.unsupported('currency.listCurrencies')
    return this.listAt(EP.currencies, opts)
  }
}
