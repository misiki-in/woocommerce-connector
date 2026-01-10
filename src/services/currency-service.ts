import type { Currency, PaginatedResponse } from '../types'
import { BaseService } from './base-service'

export class CurrencyService extends BaseService {
  private static instance:CurrencyService 

  static getInstance(): CurrencyService {
    if (!CurrencyService.instance) {
      CurrencyService.instance = new CurrencyService()
    }
    return CurrencyService.instance
  }

	async listCurrencies() {
		const response = await this.get<{ data: { currencies: Currency[] } }>('/store/currencies')
		return {
			data: response.data.currencies || [],
			count: response.data.currencies?.length || 0
		}
	}

	async getCurrency(code: string) {
		const response = await this.get<{ data: { currency: Currency } }>(`/store/currencies/${code}`)
		return response.data.currency
	}
}

export const currencyService = CurrencyService.getInstance()
