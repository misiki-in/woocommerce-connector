import type { Currency, PaginatedResponse } from '../types'
import { BaseService } from './base-service'

<<<<<<< HEAD
// WooCommerce doesn't have a built-in currencies endpoint
// This service returns available currencies for WooCommerce
const supportedCurrencies = [
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', symbolNative: '$', decimalDigits: 2, rounding: 0 },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', symbolNative: 'R$', decimalDigits: 2, rounding: 0 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', symbolNative: '$', decimalDigits: 2, rounding: 0 },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', symbolNative: 'CHF', decimalDigits: 2, rounding: 5 },
  { code: 'CNY', name: 'Chinese Renminbi Yuan', symbol: '¥', symbolNative: '¥', decimalDigits: 2, rounding: 0 },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', symbolNative: 'Kč', decimalDigits: 2, rounding: 0 },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr', symbolNative: 'kr', decimalDigits: 2, rounding: 0 },
  { code: 'EUR', name: 'Euro', symbol: '€', symbolNative: '€', decimalDigits: 2, rounding: 0 },
  { code: 'GBP', name: 'British Pound', symbol: '£', symbolNative: '£', decimalDigits: 2, rounding: 0 },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', symbolNative: '$', decimalDigits: 2, rounding: 0 },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', symbolNative: 'Ft', decimalDigits: 0, rounding: 0 },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', symbolNative: 'Rp', decimalDigits: 0, rounding: 0 },
  { code: 'ILS', name: 'Israeli New Sheqel', symbol: '₪', symbolNative: '₪', decimalDigits: 2, rounding: 0 },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', symbolNative: '₹', decimalDigits: 2, rounding: 0 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', symbolNative: '¥', decimalDigits: 0, rounding: 0 },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', symbolNative: '₩', decimalDigits: 0, rounding: 0 },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$', symbolNative: '$', decimalDigits: 2, rounding: 0 },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', symbolNative: 'RM', decimalDigits: 2, rounding: 0 },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', symbolNative: 'kr', decimalDigits: 2, rounding: 0 },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', symbolNative: '$', decimalDigits: 2, rounding: 0 },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', symbolNative: '₱', decimalDigits: 2, rounding: 0 },
  { code: 'PLN', name: 'Polish Złoty', symbol: 'zł', symbolNative: 'zł', decimalDigits: 2, rounding: 0 },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽', symbolNative: '₽', decimalDigits: 2, rounding: 0 },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', symbolNative: 'kr', decimalDigits: 2, rounding: 0 },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', symbolNative: '$', decimalDigits: 2, rounding: 0 },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', symbolNative: '฿', decimalDigits: 2, rounding: 0 },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', symbolNative: '₺', decimalDigits: 2, rounding: 0 },
  { code: 'TWD', name: 'Taiwan New Dollar', symbol: 'NT$', symbolNative: '$', decimalDigits: 2, rounding: 0 },
  { code: 'USD', name: 'United States Dollar', symbol: '$', symbolNative: '$', decimalDigits: 2, rounding: 0 },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', symbolNative: 'R', decimalDigits: 2, rounding: 0 }
]

export class CurrencyService extends BaseService {
  private static instance: CurrencyService

  static getInstance(): CurrencyService {
    if (!CurrencyService.instance) {
      CurrencyService.instance = new CurrencyService()
    }
    return CurrencyService.instance
  }

  /**
   * List all supported currencies
   * WooCommerce doesn't have a built-in currencies endpoint,
   * so we return a hardcoded list of commonly supported currencies
   */
  async listCurrencies(): Promise<{ data: Currency[]; count: number }> {
    return {
      data: supportedCurrencies.map(c => ({
        ...c,
        includesTax: false
      })),
      count: supportedCurrencies.length
    }
  }

  /**
   * Get currency by code
   */
  async getCurrency(code: string): Promise<Currency | null> {
    const currency = supportedCurrencies.find(c => c.code === code.toUpperCase())
    if (!currency) return null
    return {
      ...currency,
      includesTax: false
    }
  }

  /**
   * Get the default currency (from WooCommerce settings)
   * This would typically come from the store settings
   */
  async getDefaultCurrency(): Promise<Currency> {
    return {
      code: 'USD',
      name: 'United States Dollar',
      symbol: '$',
      symbolNative: '$',
      decimalDigits: 2,
      rounding: 0,
      includesTax: false
    }
  }
=======
/**
 * Common currencies supported by Shopify
 */
const SUPPORTED_CURRENCIES: Currency[] = [
    { code: 'USD', name: 'US Dollar', symbol: '$', decimalDigits: 2, rounding: 0 },
    { code: 'EUR', name: 'Euro', symbol: '€', decimalDigits: 2, rounding: 0 },
    { code: 'GBP', name: 'British Pound', symbol: '£', decimalDigits: 2, rounding: 0 },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', decimalDigits: 2, rounding: 0 },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', decimalDigits: 2, rounding: 0 },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimalDigits: 0, rounding: 0 },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', decimalDigits: 2, rounding: 0 },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', decimalDigits: 2, rounding: 0 },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', decimalDigits: 2, rounding: 0 },
    { code: 'MXN', name: 'Mexican Peso', symbol: '$', decimalDigits: 2, rounding: 0 },
]

export class CurrencyService extends BaseService {
    private static instance: CurrencyService

    static getInstance(): CurrencyService {
        if (!CurrencyService.instance) {
            CurrencyService.instance = new CurrencyService()
        }
        return CurrencyService.instance
    }

    /**
     * List all available currencies
     * Note: Shopify doesn't have a currencies endpoint in Admin API
     * Returns a list of supported currencies
     */
    async listCurrencies() {
        return {
            data: SUPPORTED_CURRENCIES,
            count: SUPPORTED_CURRENCIES.length
        }
    }

    /**
     * Get shop currency or specific currency by code
     * Note: Shopify Admin API doesn't have individual currency endpoint
     * Use /shop.json to get the shop's currency
     * @param code - Currency code (optional, returns shop currency if not provided)
     */
    async getCurrency(code?: string) {
        try {
            const shop = await this.get<any>('/shop.json')
            const shopCurrency = shop.currency

            if (code) {
                const currency = SUPPORTED_CURRENCIES.find(c => c.code === code)
                return currency || null
            }

            // Return shop currency if no code specified
            return {
                code: shopCurrency,
                name: SUPPORTED_CURRENCIES.find(c => c.code === shopCurrency)?.name || 'Unknown',
                symbol: SUPPORTED_CURRENCIES.find(c => c.code === shopCurrency)?.symbol || '',
                decimalDigits: 2,
                rounding: 0
            }
        } catch (error) {
            console.error("Error fetching currency:", error)
            // Return default currency on error
            return SUPPORTED_CURRENCIES[0]
        }
    }
>>>>>>> f348a1b (feat: product listing)
}

export const currencyService = CurrencyService.getInstance()
