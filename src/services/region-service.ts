import { BaseService } from './base.service'

/** Region, mirrored from the storefront contract's `Region`. */
export type Region = {
  id: string
  name: string
  currencyCode: string
  currency: string
  taxRate: number
  taxCode: string | null
  metadata: Record<string, any> | null
  createdAt: string | null
  updatedAt: string | null
  deletedAt: string | null
}

type WooSettingOption = { id?: string; value?: unknown }

function optionMap(raw: WooSettingOption[] | undefined): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const o of Array.isArray(raw) ? raw : []) if (o?.id) out[o.id] = o.value
  return out
}

/**
 * RegionService — WooCommerce. Signatures mirror the storefront contract.
 *
 * WooCommerce has no Medusa-style "region" (currency + countries + tax + payment providers
 * bundled together). Currency and base country are store-wide settings, and the only
 * per-territory object is a SHIPPING ZONE.
 */
export class RegionService extends BaseService {
  private static instance: RegionService
  static getInstance(): RegionService { if (!RegionService.instance) RegionService.instance = new RegionService(); return RegionService.instance }

  /**
   * Numeric id  -> the shipping zone with that id, which is the closest WooCommerce analogue:
   *   v3 GET /shipping/zones/{id}          https://woocommerce.github.io/woocommerce-rest-api-docs/#shipping-zones
   *   v3 GET /shipping/zones/{id}/locations  (entries of type country/state/postcode/continent)
   *   v3 GET /shipping/zones/{id}/methods
   * Anything else -> the store-wide "region" built from v3 GET /settings/general, which is
   * what the storefront's own implementation returns (it calls /api/settings and ignores the id).
   * We never send a non-numeric id to /shipping/zones/{id}: that route only matches digits
   * and would 404 in a customer's store.
   *
   * Currency is always store-wide (woocommerce_currency) — WooCommerce core is single-currency.
   */
  async getRegionByRegionId(id: string): Promise<Region> {
    const general = optionMap(await this.get<WooSettingOption[]>('/settings/general'))
    const currency = String(general['woocommerce_currency'] ?? '')
    const baseCountry = String(general['woocommerce_default_country'] ?? '')

    const base: Region = {
      id: String(id ?? ''),
      name: baseCountry,
      currencyCode: currency,
      currency,
      // WooCommerce tax rates are per country/state/class (v3 GET /taxes), not per region or
      // per zone, so there is no single honest rate to report here.
      taxRate: 0,
      taxCode: null,
      metadata: null,
      createdAt: null,
      updatedAt: null,
      deletedAt: null
    }

    if (!/^\d+$/.test(String(id))) {
      return { ...base, metadata: { source: 'settings/general', baseCountry } }
    }

    const [zone, locations, methods] = await Promise.all([
      this.get<{ id?: number; name?: string; order?: number }>(`/shipping/zones/${id}`),
      this.get<{ code?: string; type?: string }[]>(`/shipping/zones/${id}/locations`),
      this.get<{ id?: number; instance_id?: number; title?: string; method_id?: string; enabled?: boolean }[]>(`/shipping/zones/${id}/methods`)
    ])

    return {
      ...base,
      id: String(zone?.id ?? id),
      name: String(zone?.name ?? baseCountry),
      metadata: {
        source: 'shipping/zones',
        zoneOrder: zone?.order ?? null,
        locations: Array.isArray(locations) ? locations : [],
        shippingMethods: (Array.isArray(methods) ? methods : []).map((m) => ({
          instanceId: m?.instance_id ?? m?.id ?? null,
          methodId: m?.method_id ?? null,
          title: m?.title ?? null,
          enabled: m?.enabled ?? false
        })),
        baseCountry
      }
    }
  }
}

export const regionService = RegionService.getInstance()
