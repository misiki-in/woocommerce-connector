import { BaseService } from './base.service'

/** State, mirrored from @misiki/litekart-connector's `State` (src/types/region-types.ts). */
export type State = {
  name: string
  code: string
}

type WooSettingOption = { id?: string; value?: unknown }

/** Fold [{ id, value }, ...] from a v3 settings group into a plain lookup. */
function optionMap(raw: WooSettingOption[] | undefined): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const o of Array.isArray(raw) ? raw : []) if (o?.id) out[o.id] = o.value
  return out
}

/** StateService — WooCommerce. Signatures mirror @misiki/litekart-connector. */
export class StateService extends BaseService {
  private static instance: StateService
  static getInstance(): StateService { if (!StateService.instance) StateService.instance = new StateService(); return StateService.instance }

  /**
   * There is NO standalone /data/states route in WooCommerce — states are nested inside the
   * country payload. litekart's list() takes no arguments, so we resolve the store's own base
   * country first and return its states, which is what an address form on a single-store
   * WooCommerce install needs.
   *
   *   v3 GET /settings/general -> woocommerce_default_country ("US:CA" or "IN")
   *   v3 GET /data/countries/{cc} -> { code, name, states: [{ code, name }] }
   *   https://woocommerce.github.io/woocommerce-rest-api-docs/#retrieve-country-data
   *
   * For a country other than the store's base country, call
   * countryService.getOne(code).states — this signature has no country parameter to pass.
   * Both endpoints are unpaginated.
   */
  async list(): Promise<State[]> {
    const general = optionMap(await this.get<WooSettingOption[]>('/settings/general'))
    // woocommerce_default_country is "CC" or "CC:SS" — the state half is the store's own state.
    const cc = String(general['woocommerce_default_country'] ?? '').split(':')[0]
    if (!cc) return []
    const country = await this.get<{ states?: { code?: string; name?: string }[] }>(`/data/countries/${encodeURIComponent(cc.toUpperCase())}`)
    return (country?.states || []).map((s) => ({ name: String(s?.name ?? ''), code: String(s?.code ?? '') }))
  }
}

export const stateService = StateService.getInstance()
