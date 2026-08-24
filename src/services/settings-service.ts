import { BaseService } from './base.service'

/** Setting, mirrored from the storefront contract's `Setting`. */
export type Setting = {
  id: string
  name: string
  description?: string
  logo?: string
  address_1?: string
  address_2?: string
  city?: string
  state?: string
  country?: string
  phone?: string
  email?: string
  zipCode?: string
  currency?: string
  language?: string
  commission?: number
  emailProvider?: string
  paymentProvider?: string
  shippingProvider?: string
  weightUnit?: string
  dimensionUnit?: string
  createdAt?: string
  updatedAt?: string
}

type WooSettingOption = { id?: string; label?: string; value?: unknown; default?: unknown; type?: string }

/** Fold [{ id, value }, ...] from a v3 settings group into a plain lookup. */
function optionMap(raw: WooSettingOption[] | undefined): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const o of Array.isArray(raw) ? raw : []) if (o?.id) out[o.id] = o.value
  return out
}

const str = (v: unknown): string | undefined => (v === undefined || v === null || v === '' ? undefined : String(v))

/**
 * Which WooCommerce settings group owns each option we write.
 * Groups are documented at https://woocommerce.github.io/woocommerce-rest-api-docs/#settings
 * (general, products, tax, shipping, checkout, account, email, integration, advanced).
 *
 * `country`/`state` are deliberately absent: they are two halves of the SINGLE composite
 * option `woocommerce_default_country` ("US:CA"), handled by defaultCountryValue() below.
 */
const GENERAL_FROM_SETTING: Record<string, string> = {
  address_1: 'woocommerce_store_address',
  address_2: 'woocommerce_store_address_2',
  city: 'woocommerce_store_city',
  zipCode: 'woocommerce_store_postcode',
  currency: 'woocommerce_currency'
}
const PRODUCTS_FROM_SETTING: Record<string, string> = {
  weightUnit: 'woocommerce_weight_unit',
  dimensionUnit: 'woocommerce_dimension_unit'
}

/** SettingService — WooCommerce. Signatures mirror the storefront contract. */
export class SettingService extends BaseService {
  private static instance: SettingService
  static getInstance(): SettingService { if (!SettingService.instance) SettingService.instance = new SettingService(); return SettingService.instance }

  /**
   * v3 GET /settings/{group_id} — "List all setting options"
   * https://woocommerce.github.io/woocommerce-rest-api-docs/#retrieve-a-setting-option
   *
   * WooCommerce has no single "store settings" record; the options are spread across groups.
   * We read `general` (address/currency) and `products` (units) and fold them into one
   * storefront Setting. Returned as a one-element array to match the storefront's `Setting[]` —
   * one WooCommerce install is exactly one store, so there is never more than one.
   * Requires a ck/cs key with at least read scope on settings.
   */
  async fetchSetting(): Promise<Setting[]> {
    const [general, products] = await Promise.all([
      this.get<WooSettingOption[]>('/settings/general'),
      this.get<WooSettingOption[]>('/settings/products')
    ])
    return [this.toSetting(optionMap(general), optionMap(products))]
  }

  /**
   * v3 POST /settings/{group_id}/batch { update: [{ id, value }] } — "Batch update setting options".
   * WooCommerce settings are a FIXED set of options: there is no create, so the storefront's "save"
   * is mapped onto a batch update of the options it actually carries. Options are routed to
   * the group that owns them (never assumed to be `general`); unmapped contract fields
   * (name, logo, description, phone, email, commission, providers) have no WooCommerce v3
   * option and are ignored rather than written to a guessed key.
   */
  async saveSettings(setting: Omit<Setting, 'id'>): Promise<Setting> {
    await this.applySetting(setting)
    return (await this.fetchSetting())[0]
  }

  /**
   * Same batch update as saveSettings(). `id` is accepted for signature compatibility and
   * ignored: WooCommerce has no settings-record id (one install = one store), and its option
   * ids are group-scoped, so an unqualified id cannot be turned into a REST path without
   * guessing the group.
   */
  async updateSettings(id: string, setting: Partial<Setting>): Promise<Setting> {
    void id
    await this.applySetting(setting)
    return (await this.fetchSetting())[0]
  }

  private toSetting(general: Record<string, unknown>, products: Record<string, unknown>): Setting {
    // woocommerce_default_country is "CC" or "CC:SS".
    const [country = '', state = ''] = String(general['woocommerce_default_country'] ?? '').split(':')
    return {
      // WooCommerce exposes no settings-record id; creds.apiUrl identifies the only store.
      id: this.creds.storeId || this.creds.apiUrl || '',
      name: '',   // The site title lives in WP core (GET /wp-json/), not in wc/v3 settings.
      address_1: str(general['woocommerce_store_address']),
      address_2: str(general['woocommerce_store_address_2']),
      city: str(general['woocommerce_store_city']),
      state: str(state),
      country: str(country),
      zipCode: str(general['woocommerce_store_postcode']),
      currency: str(general['woocommerce_currency']),
      weightUnit: str(products['woocommerce_weight_unit']),
      dimensionUnit: str(products['woocommerce_dimension_unit'])
    }
  }

  private async applySetting(setting: Partial<Setting>): Promise<void> {
    const build = (map: Record<string, string>) =>
      Object.entries(map)
        .filter(([field]) => (setting as Record<string, unknown>)[field] !== undefined)
        .map(([field, optionId]) => ({ id: optionId, value: (setting as Record<string, unknown>)[field] as unknown }))

    const general = build(GENERAL_FROM_SETTING)
    if (setting.country !== undefined || setting.state !== undefined) {
      general.push({ id: 'woocommerce_default_country', value: await this.defaultCountryValue(setting) })
    }
    const products = build(PRODUCTS_FROM_SETTING)
    const calls: Promise<unknown>[] = []
    if (general.length) calls.push(this.post('/settings/general/batch', { update: general }))
    if (products.length) calls.push(this.post('/settings/products/batch', { update: products }))
    await Promise.all(calls)
  }

  /**
   * Compose `woocommerce_default_country`. fetchSetting() splits that one option into
   * `country` + `state`, so writing either half on its own would silently destroy the other
   * (saving a Setting straight back would turn "US:CA" into "US"). Rules:
   *   - both halves supplied  -> use them
   *   - only the state        -> keep the stored country
   *   - only the country      -> keep the stored state ONLY if the country is unchanged;
   *                              a different country invalidates the old state code
   * A caller that already passes the composite "CC:SS" in `country` is passed through as-is.
   */
  private async defaultCountryValue(setting: Partial<Setting>): Promise<string> {
    if (setting.country && setting.country.includes(':')) return setting.country

    const stored = String(optionMap(await this.get<WooSettingOption[]>('/settings/general'))['woocommerce_default_country'] ?? '')
    const [storedCountry = '', storedState = ''] = stored.split(':')

    const country = setting.country ?? storedCountry
    const state =
      setting.state !== undefined ? setting.state : country === storedCountry ? storedState : ''

    return state ? `${country}:${state}` : country
  }
}

export const settingService = SettingService.getInstance()
/** Alias kept for the WooCommerce connector's existing export name. */
export const settingsService = settingService
