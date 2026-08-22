import { BaseService } from './base.service'

/** Store details, mirrored from @misiki/litekart-connector's StoreService. */
export interface StoreDetails {
  id: string
  name: string
  domain: string
  logo?: string
  favicon?: string
  description?: string
  address?: {
    street?: string
    city?: string
    state?: string
    country?: string
    zipCode?: string
  }
  contact?: {
    email?: string
    phone?: string
    website?: string
  }
  settings?: {
    currency?: string
    timezone?: string
    language?: string
    [key: string]: unknown
  }
  isActive: boolean
  createdAt: string
  updatedAt: string
}

/** Parameters for fetching store details. */
export interface GetStoreParams {
  /** The ID of the store to fetch */
  storeId?: string
  /** The domain name of the store to fetch */
  domain?: string
}

type WooSettingOption = { id?: string; value?: unknown }

function optionMap(raw: WooSettingOption[] | undefined): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const o of Array.isArray(raw) ? raw : []) if (o?.id) out[o.id] = o.value
  return out
}

const str = (v: unknown): string | undefined => (v === undefined || v === null || v === '' ? undefined : String(v))

function hostOf(url: string): string {
  try { return new URL(url).host } catch { return '' }
}

/** StoreService — WooCommerce. Signatures mirror @misiki/litekart-connector. */
export class StoreService extends BaseService {
  private static instance: StoreService
  static getInstance(): StoreService { if (!StoreService.instance) StoreService.instance = new StoreService(); return StoreService.instance }

  /**
   * One WooCommerce install is exactly ONE store and creds.apiUrl already identifies it, so
   * there is no store-directory endpoint to look `storeId` / `domain` up in. Both arguments
   * are therefore only validated (litekart's "Either storeId or domain must be provided"
   * contract is kept) and then ignored; the store described is always creds.apiUrl's.
   *
   * Composed from:
   *   v3 GET /settings/general — https://woocommerce.github.io/woocommerce-rest-api-docs/#settings
   *     woocommerce_store_address/_address_2/_city/_store_postcode/_default_country -> address
   *     woocommerce_currency -> settings.currency
   *   GET /wp-json/ — the public WordPress REST API index, which carries the site `name`,
   *     `description`, `url` and `timezone_string` anonymously. It sits above /wp/v2, so it is
   *     reached through request() with an explicit namespace rather than wpGet(). Best effort:
   *     a site that blocks the index still yields a store from the settings above.
   */
  async getStoreByIdOrDomain({ storeId, domain }: GetStoreParams): Promise<StoreDetails> {
    if (!storeId && !domain) {
      throw new Error('Either storeId or domain must be provided')
    }

    const [general, site] = await Promise.all([
      this.get<WooSettingOption[]>('/settings/general'),
      this.wpIndex()
    ])
    const g = optionMap(general)
    const [country = '', state = ''] = String(g['woocommerce_default_country'] ?? '').split(':')
    const apiUrl = this.creds.apiUrl || ''

    return {
      id: String(storeId || this.creds.storeId || apiUrl),
      name: String(site.name ?? ''),
      domain: String(domain || hostOf(String(site.url ?? apiUrl)) || apiUrl),
      description: str(site.description),
      address: {
        street: [str(g['woocommerce_store_address']), str(g['woocommerce_store_address_2'])].filter(Boolean).join(', ') || undefined,
        city: str(g['woocommerce_store_city']),
        state: str(state),
        country: str(country),
        zipCode: str(g['woocommerce_store_postcode'])
      },
      contact: {
        // The admin email and store phone are WP core options behind wp/v2/settings, which the
        // ck/cs Basic header does not authenticate — left undefined rather than fabricated.
        website: str(site.url) || apiUrl
      },
      settings: {
        currency: str(g['woocommerce_currency']),
        timezone: str(site.timezone_string),
        // The WP REST index carries name/description/url/gmt_offset/timezone_string but NOT a
        // locale; WPLANG lives behind wp/v2/settings, which ck/cs cannot read. Left undefined.
        language: undefined
      },
      // A store that answers /settings/general is a live store; WooCommerce has no
      // "store is active" flag (there is no multi-store registry to be inactive in).
      isActive: true,
      // WooCommerce exposes no install/update timestamps for the store itself.
      createdAt: '',
      updatedAt: ''
    }
  }

  /** GET /wp-json/ — public WP REST API index. Best effort; never blocks the store lookup. */
  private async wpIndex(): Promise<Record<string, unknown>> {
    try {
      const raw = await this.request<Record<string, unknown>>('', { method: 'GET' }, false, '/wp-json')
      return raw && typeof raw === 'object' ? raw : {}
    } catch { return {} }
  }
}

export const storeService = StoreService.getInstance()
