import { BaseService } from './base.service'

/**
 * Country, mirrored from @misiki/litekart-connector's `Country` (src/types/region-types.ts).
 * `states` is additive: WooCommerce ships them nested inside the same payload, so exposing
 * them here saves callers a second round trip.
 */
export type Country = {
  name: string
  iso2: string
  states?: { name: string; code: string }[]
}

type WooCountry = { code?: string; name?: string; states?: { code?: string; name?: string }[] }

function mapCountry(raw: WooCountry): Country {
  return {
    name: String(raw?.name ?? ''),
    iso2: String(raw?.code ?? ''),
    states: (raw?.states || []).map((s) => ({ name: String(s?.name ?? ''), code: String(s?.code ?? '') }))
  }
}

/** CountryService — WooCommerce. Signatures mirror @misiki/litekart-connector. */
export class CountryService extends BaseService {
  private static instance: CountryService
  static getInstance(): CountryService { if (!CountryService.instance) CountryService.instance = new CountryService(); return CountryService.instance }

  /**
   * v3 GET /data/countries — "List all continents/countries"
   * https://woocommerce.github.io/woocommerce-rest-api-docs/#list-all-countries
   * Returns every country WooCommerce knows as [{ code, name, states: [{ code, name }] }].
   * Requires ck/cs (there is no Store API equivalent) and takes no page/per_page — the
   * endpoint is unpaginated, so the full list comes back in one response.
   */
  async list(): Promise<Country[]> {
    const raw = await this.get<WooCountry[]>('/data/countries')
    return (Array.isArray(raw) ? raw : []).map(mapCountry)
  }

  /**
   * v3 GET /data/countries/{code} — single country, e.g. /data/countries/IN.
   * Additive helper (litekart has no equivalent); used by StateService.
   */
  async getOne(code: string): Promise<Country> {
    return mapCountry(await this.get<WooCountry>(`/data/countries/${encodeURIComponent(String(code).toUpperCase())}`))
  }
}

export const countryService = CountryService.getInstance()
