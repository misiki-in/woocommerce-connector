import { BaseService } from './base.service'
/** CurrencyService — present-but-dummy (mirrors litekart-connector); returns dummy data, never throws. */
export class CurrencyService extends BaseService {
  private static instance: CurrencyService
  static getInstance(): CurrencyService { if (!CurrencyService.instance) CurrencyService.instance = new CurrencyService(); return CurrencyService.instance }
  async listCurrencies(..._args: any[]): Promise<any> { return this.emptyPage() }
}
export const currencyService = CurrencyService.getInstance()
