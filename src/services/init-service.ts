import { BaseService } from './base.service'

/**
 * Bootstrap payload. litekart's `Init` (src/types/common-types.ts) is just `{ name: string }`;
 * the extra fields are additive so the composed payload is actually usable.
 */
export type Init = {
  name: string
  currency?: { code: string; name: string; symbol: string } | null
  /** 'left' | 'right' | 'left_space' | 'right_space' — woocommerce_currency_pos. */
  currencyPosition?: string | null
  priceFormat?: { thousandSeparator: string; decimalSeparator: string; decimals: number } | null
  baseCountry?: string | null
  baseState?: string | null
  address?: { street?: string; city?: string; state?: string; country?: string; zipCode?: string } | null
  paymentGateways?: { id: string; title: string; description: string; methodTitle: string; enabled: boolean }[]
}

type WooSettingOption = { id?: string; value?: unknown }

function optionMap(raw: WooSettingOption[] | undefined): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const o of Array.isArray(raw) ? raw : []) if (o?.id) out[o.id] = o.value
  return out
}

const str = (v: unknown): string | undefined => (v === undefined || v === null || v === '' ? undefined : String(v))

/** InitService — WooCommerce. Signatures mirror @misiki/litekart-connector. */
export class InitService extends BaseService {
  private static instance: InitService
  static getInstance(): InitService { if (!InitService.instance) InitService.instance = new InitService(); return InitService.instance }

  /**
   * WooCommerce has no single bootstrap endpoint, so this is composed from three real v3
   * routes fetched in parallel:
   *   GET /settings/general        https://woocommerce.github.io/woocommerce-rest-api-docs/#retrieve-a-setting-option
   *   GET /data/currencies/current https://woocommerce.github.io/woocommerce-rest-api-docs/#retrieve-current-currency
   *   GET /payment_gateways        https://woocommerce.github.io/woocommerce-rest-api-docs/#payment-gateways
   *
   * Returned as a one-element array to match litekart's `Init[]`. `/system_status` is
   * deliberately not included: it is a heavy admin diagnostic payload and needs a
   * manager-scoped key, so it would turn a storefront boot into a 401 on read-only keys.
   */
  async fetchInit(): Promise<Init[]> {
    const [general, currency, gateways] = await Promise.all([
      this.get<WooSettingOption[]>('/settings/general'),
      this.get<{ code?: string; name?: string; symbol?: string }>('/data/currencies/current'),
      this.get<any[]>('/payment_gateways')
    ])
    const g = optionMap(general)
    // woocommerce_default_country is "CC" or "CC:SS".
    const [country = '', state = ''] = String(g['woocommerce_default_country'] ?? '').split(':')
    const decimals = Number(g['woocommerce_price_num_decimals'])

    return [{
      // wc/v3 carries no site title; that lives in WP core (see StoreService.getStoreByIdOrDomain).
      name: '',
      currency: currency ? { code: String(currency.code ?? ''), name: String(currency.name ?? ''), symbol: String(currency.symbol ?? '') } : null,
      currencyPosition: str(g['woocommerce_currency_pos']) ?? null,
      priceFormat: {
        thousandSeparator: String(g['woocommerce_price_thousand_sep'] ?? ','),
        decimalSeparator: String(g['woocommerce_price_decimal_sep'] ?? '.'),
        decimals: Number.isFinite(decimals) ? decimals : 2
      },
      baseCountry: country || null,
      baseState: state || null,
      address: {
        street: [str(g['woocommerce_store_address']), str(g['woocommerce_store_address_2'])].filter(Boolean).join(', ') || undefined,
        city: str(g['woocommerce_store_city']),
        state: str(state),
        country: str(country),
        zipCode: str(g['woocommerce_store_postcode'])
      },
      paymentGateways: (Array.isArray(gateways) ? gateways : [])
        .filter((gw) => gw?.enabled)
        .map((gw) => ({
          id: String(gw?.id ?? ''),
          title: String(gw?.title ?? ''),
          description: String(gw?.description ?? ''),
          methodTitle: String(gw?.method_title ?? ''),
          enabled: !!gw?.enabled
        }))
    }]
  }
}

export const initService = InitService.getInstance()
