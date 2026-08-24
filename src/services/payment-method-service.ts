import type { PaginatedResponse } from '../types'
import { WooBaseService } from './cart-service'

/**
 * PaymentMethodService — WooCommerce. Signatures mirror the storefront contract.
 *
 * GET /wp-json/wc/v3/payment_gateways
 * https://woocommerce.github.io/woocommerce-rest-api-docs/#list-all-payment-gateways
 *
 * This route has NO pagination and NO query parameters, so `page`/`sort` are ignored and
 * `q` is applied client-side. Only the array length is reported as the count — nothing
 * is fabricated. Single gateway: GET /payment_gateways/{id}.
 *
 * Storefront note: /payment_gateways is the ADMIN view (every gateway on the install).
 * The gateways actually usable for the current cart — after country, cart total and
 * coupons are considered — are on Store API GET /cart -> payment_methods.
 */

/** The storefront's PaymentMethod shape, filled from a WooCommerce gateway. */
export type PaymentMethod = {
  id: string
  name: string
  type: string
  active: boolean
  isTest: boolean
  manualCapture: boolean
  value: string
  createdAt: string
  updatedAt: string
  description: string | null
  order: number
}

const settingValue = (gateway: any, key: string): string => {
  const v = gateway?.settings?.[key]?.value
  return v === undefined || v === null ? '' : String(v)
}

export function mapPaymentGateway(raw: any): PaymentMethod {
  return {
    id: String(raw?.id ?? ''),
    name: String(raw?.title ?? raw?.method_title ?? raw?.id ?? ''),
    type: String(raw?.method_title ?? raw?.id ?? ''),
    active: Boolean(raw?.enabled),
    // Gateway-specific settings; absent on gateways that have no such option.
    isTest: settingValue(raw, 'testmode') === 'yes',
    manualCapture: settingValue(raw, 'capture') === 'no',
    value: String(raw?.id ?? ''),
    // WooCommerce gateways are configuration, not records — they carry no timestamps.
    createdAt: '',
    updatedAt: '',
    description: raw?.description || raw?.method_description || null,
    order: Number(raw?.order ?? 0) || 0
  }
}

export class PaymentMethodService extends WooBaseService {
  private static instance: PaymentMethodService
  static getInstance(): PaymentMethodService {
    if (!PaymentMethodService.instance) PaymentMethodService.instance = new PaymentMethodService()
    return PaymentMethodService.instance
  }

  /**
   * Lists the store's ENABLED payment gateways. `page` and `sort` are accepted for
   * signature compatibility but the endpoint supports neither; `q` filters locally on
   * gateway id/title.
   */
  async list({ page = 1, q = '', sort = '-createdAt' } = {}): Promise<PaginatedResponse<PaymentMethod>> {
    void sort // /payment_gateways ignores orderby/order; results come back in admin order.
    const raw = await this.get<any[]>('/payment_gateways')
    const list = Array.isArray(raw) ? raw : []
    const needle = (q || '').trim().toLowerCase()
    const data = list
      .map(mapPaymentGateway)
      .filter((g) => g.active)
      .filter((g) => !needle || g.id.toLowerCase().includes(needle) || g.name.toLowerCase().includes(needle))
      .sort((a, b) => a.order - b.order)
    // No pagination on this route: the whole (filtered) set is one page.
    return { data, count: data.length, pageSize: data.length, noOfPage: 1, page }
  }
}

// Use singleton instance
export const paymentMethodService = PaymentMethodService.getInstance()
