import type { PaginatedResponse } from '../types'
import { BaseService } from './base.service'

/**
 * Currency, mirrored from the storefront contract's `Currency`.
 * `code`/`symbol` are additive — WooCommerce returns them in the same payload.
 */
export type Currency = {
  id: string
  name: string
  code?: string
  symbol?: string
}

type WooCurrency = { code?: string; name?: string; symbol?: string }

function mapCurrency(raw: WooCurrency): Currency {
  return {
    id: String(raw?.code ?? ''),
    name: String(raw?.name ?? ''),
    code: String(raw?.code ?? ''),
    symbol: String(raw?.symbol ?? '')
  }
}

/** CurrencyService — WooCommerce. Signatures mirror the storefront contract. */
export class CurrencyService extends BaseService {
  private static instance: CurrencyService
  static getInstance(): CurrencyService { if (!CurrencyService.instance) CurrencyService.instance = new CurrencyService(); return CurrencyService.instance }

  /**
   * v3 GET /data/currencies — "List all currencies"
   * https://woocommerce.github.io/woocommerce-rest-api-docs/#list-all-currencies
   * Returns [{ code, name, symbol }]. Unpaginated, so the whole list arrives in one response
   * and noOfPage is genuinely 1 rather than a guess.
   *
   * NB: WooCommerce core is single-currency; this is the catalogue of currencies the store
   * *could* be configured with, not a list of currencies a shopper can switch between.
   * The active one is getCurrentCurrency() below.
   */
  async listCurrencies(): Promise<PaginatedResponse<Currency>> {
    const raw = await this.get<WooCurrency[]>('/data/currencies')
    const data = (Array.isArray(raw) ? raw : []).map(mapCurrency)
    return { data, count: data.length, pageSize: data.length, noOfPage: 1, page: 1 }
  }

  /**
   * v3 GET /data/currencies/current — the store's active currency.
   * Additive helper (the contract has no equivalent); used by InitService/SettingService.
   */
  async getCurrentCurrency(): Promise<Currency> {
    return mapCurrency(await this.get<WooCurrency>('/data/currencies/current'))
  }
}

export const currencyService = CurrencyService.getInstance()
