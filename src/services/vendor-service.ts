import type { PaginatedResponse, Product } from '../types'
import { mapProductGeneric } from '../mappers/generic.mapper'
import { BaseService } from './base.service'

const FIELDS = { id: 'id', title: 'name', slug: 'slug', price: 'price', mrp: 'regular_price', description: 'description', image: 'images.0.src', stock: 'stock_quantity' } as const

/**
 * Vendor shape — structurally identical to the storefront contract's `Vendor`.
 * Declared locally because the WooCommerce connector's src/types/index.ts does
 * not export one.
 */
export type WooVendor = {
  id: string
  status?: string | null
  address?: string | null
  email: string
  phone: string
  dialCode?: string | null
  name?: string | null
  email2?: string | null
  banners?: string | null
  logo?: string | null
  countryName?: string | null
  country?: string | null
  about?: string | null
  businessName: string
  website?: string | null
  description?: string | null
  info?: string | null
  shippingCharges: number
  codCharges: number
  slug?: string | null
  featuredImage?: string | null
  isEmailVerified: boolean
  isPhoneVerified: boolean
  address_1?: string | null
  address_2?: string | null
  city?: string | null
  isApproved: boolean
  isDeleted: boolean
  state?: string | null
  tax_number?: string | null
  zip?: string | null
  user: string
  createdAt: string
  updatedAt: string
}

/** Store-wide sales summary assembled from the v3 /reports/* endpoints. */
export type WooVendorDashboard = {
  period: string
  totalSales: number
  netSales: number
  averageSales: number
  totalOrders: number
  totalItems: number
  totalTax: number
  totalShipping: number
  totalRefunds: number
  totalDiscount: number
  totalCustomers: number
  topSellers: { productId: string; title: string; quantity: number }[]
  orderTotals: { slug: string; name: string; total: number }[]
}

/** { slug, name, total } rows as returned by the v3 /reports/*\/totals endpoints. */
export type WooReportTotal = { slug: string; name: string; total: number }

const num = (v: unknown): number => {
  const n = typeof v === 'string' ? parseFloat(v) : (v as number)
  return Number.isFinite(n) ? n : 0
}

/**
 * VendorService — WooCommerce. Signatures mirror the storefront contract.
 *
 * WooCommerce core is SINGLE-VENDOR: one install is one store, and there is no vendor
 * resource in /wp-json/wc/v3, the Store API or WP core. Multi-vendor comes from Dokan
 * (dokan/v1/stores), WCFM (wcfmmp/v1/store-vendors) or WC Vendors — none of which are
 * guaranteed installed, so none of those namespaces are hardcoded here.
 *
 * Where a single-vendor stand-in exists it is used and labelled as such:
 * "the vendor" is the store itself (GET /settings/general) and "the vendor's numbers"
 * are the store-wide reports (GET /reports/*).
 */
export class VendorService extends BaseService {
  private static instance: VendorService
  static getInstance(): VendorService { if (!VendorService.instance) VendorService.instance = new VendorService(); return VendorService.instance }

  /** Pick a setting option's value out of the array returned by GET /settings/{group}. */
  private settingValue(rows: any, id: string): string {
    const row = Array.isArray(rows) ? rows.find((r: any) => r?.id === id) : undefined
    const v = row?.value ?? row?.default
    return v == null ? '' : String(v)
  }

  /**
   * The store, expressed as the single vendor.
   * GET /wp-json/wc/v3/settings/general
   * (docs: https://woocommerce.github.io/woocommerce-rest-api-docs/#list-all-setting-options)
   */
  private async storeAsVendor(): Promise<WooVendor> {
    const rows = await this.get<any[]>('/settings/general')
    // woocommerce_default_country is stored as "US:CA" (country[:state]).
    const [country = '', state = ''] = this.settingValue(rows, 'woocommerce_default_country').split(':')
    const address1 = this.settingValue(rows, 'woocommerce_store_address')
    const address2 = this.settingValue(rows, 'woocommerce_store_address_2')
    const city = this.settingValue(rows, 'woocommerce_store_city')
    const zip = this.settingValue(rows, 'woocommerce_store_postcode')
    const id = this.creds.storeId || this.creds.apiUrl || ''
    return {
      id,
      user: id,
      // The store name lives in the WP core option `blogname`, which needs a WordPress
      // credential this connector does not hold — so it is left empty rather than guessed.
      name: null,
      businessName: '',
      // WooCommerce settings expose no store email/phone/website/logo/tax number.
      email: '',
      phone: '',
      website: null,
      logo: null,
      banners: null,
      featuredImage: null,
      about: null,
      description: null,
      info: null,
      dialCode: null,
      email2: null,
      slug: null,
      status: null,
      tax_number: null,
      address: [address1, address2, city, state, zip, country].filter(Boolean).join(', ') || null,
      address_1: address1 || null,
      address_2: address2 || null,
      city: city || null,
      state: state || null,
      zip: zip || null,
      country: country || null,
      countryName: null,
      // Not modelled by WooCommerce settings; neutral defaults, not read from the API.
      shippingCharges: 0,
      codCharges: 0,
      isEmailVerified: false,
      isPhoneVerified: false,
      isApproved: true,
      isDeleted: false,
      createdAt: '',
      updatedAt: ''
    }
  }

  /** PLACEHOLDER: WooCommerce has no vendor resource to create. */
  async save(data: Partial<WooVendor>): Promise<any> {
    void data
    return this.dummy({})
  }

  /**
   * PLACEHOLDER: no vendor object to update. Store details would be
   * POST /settings/general/batch, which is a very different thing and is deliberately
   * not mapped onto here.
   */
  async update(data: Partial<WooVendor> & { id: string }): Promise<any> {
    void data
    return this.dummy({})
  }

  /** PLACEHOLDER: there is no vendor collection in WooCommerce core — one install is one store. */
  async list({ page = 1, q = '', sort = '-createdAt' }: { page?: number; q?: string; sort?: string } = {}): Promise<PaginatedResponse<WooVendor>> {
    void page; void q; void sort
    return this.emptyPage<WooVendor>()
  }

  /**
   * Single-vendor stand-in: `id` is ignored because there is only ever one store.
   * Backed by GET /settings/general.
   */
  async getVendor(id: string): Promise<WooVendor> {
    void id
    return this.storeAsVendor()
  }

  /** Single-vendor stand-in: the store itself, from GET /settings/general. */
  async fetchMyVendorDetails(): Promise<WooVendor> {
    return this.storeAsVendor()
  }

  /**
   * STORE-WIDE (not per-vendor) sales summary.
   * GET /reports/sales?period=month, GET /reports/top_sellers?period=month and
   * GET /reports/orders/totals
   * (docs: https://woocommerce.github.io/woocommerce-rest-api-docs/#reports).
   * /reports/sales returns a single-element array.
   */
  async fetchDashboard(period: 'week' | 'month' | 'last_month' | 'year' = 'month'): Promise<WooVendorDashboard> {
    const query = this.qs({ period })
    const [salesRaw, topRaw, orderTotalsRaw] = await Promise.all([
      this.get<any[]>('/reports/sales' + query),
      this.get<any[]>('/reports/top_sellers' + query),
      this.get<any[]>('/reports/orders/totals')
    ])
    const s = (Array.isArray(salesRaw) ? salesRaw[0] : salesRaw) || {}
    return {
      period,
      totalSales: num(s.total_sales),
      netSales: num(s.net_sales),
      averageSales: num(s.average_sales),
      totalOrders: num(s.total_orders),
      totalItems: num(s.total_items),
      totalTax: num(s.total_tax),
      totalShipping: num(s.total_shipping),
      totalRefunds: num(s.total_refunds),
      totalDiscount: num(s.total_discount),
      totalCustomers: num(s.total_customers),
      // top_sellers rows are { title, product_id, quantity }.
      topSellers: (Array.isArray(topRaw) ? topRaw : []).map((t: any) => ({
        productId: String(t?.product_id ?? ''),
        title: String(t?.title ?? ''),
        quantity: num(t?.quantity)
      })),
      orderTotals: (Array.isArray(orderTotalsRaw) ? orderTotalsRaw : []).map((t: any) => ({
        slug: String(t?.slug ?? ''),
        name: String(t?.name ?? ''),
        total: num(t?.total)
      }))
    }
  }

  /**
   * `vendorId` is IGNORED: WooCommerce core is single-vendor and /products has no vendor
   * filter, so this returns the whole catalogue — which is the correct answer for a
   * single-vendor store. per_page is passed explicitly (v3 defaults to 10, max 100).
   */
  async fetchProductsOfVendor(vendorId: string): Promise<Product[]> {
    void vendorId
    const raw = await this.get<any[]>('/products' + this.qs({ per_page: 100, status: 'publish' }))
    return (Array.isArray(raw) ? raw : []).map((p) => mapProductGeneric(p, FIELDS, { storeId: this.creds.storeId }))
  }

  /**
   * Store-wide stand-in, NOT a per-vendor rating: WooCommerce has no vendor-rating concept.
   * GET /reports/reviews/totals returns the review count per star rating
   * ({ slug, name, total }), which for a single-vendor store is the store's own
   * rating distribution. `vendorId` is ignored.
   */
  async getAllVendorRatings(vendorId: string): Promise<WooReportTotal[]> {
    void vendorId
    const raw = await this.get<any[]>('/reports/reviews/totals')
    return (Array.isArray(raw) ? raw : []).map((r: any) => ({
      slug: String(r?.slug ?? ''),
      name: String(r?.name ?? ''),
      total: num(r?.total)
    }))
  }
}

export const vendorService = VendorService.getInstance()
