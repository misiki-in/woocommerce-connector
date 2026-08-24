import type { PaginatedResponse } from '../types'
import { BaseService } from './base.service'

/**
 * Address shape — structurally identical to the storefront contract's `Address`.
 * Declared locally because the WooCommerce connector's src/types/index.ts does
 * not export one.
 */
export type WooAddress = {
  id: string
  active: boolean
  address_1: string | null
  address_2: string | null
  city: string | null
  country: string | null
  deliveryInstructions: string | null
  email: string | null
  firstName: string | null
  isPrimary: boolean
  isResidential: boolean
  lastName: string | null
  lat: number | null
  lng: number | null
  locality: string | null
  phone: string | null
  state: string | null
  userId: string | null
  zip: string | null
  createdAt: string
  updatedAt: string
  countryCode: string | null
}

export interface ListAddressesParams {
  page?: number
  q?: string
  sort?: string
  /** WooCommerce customer id. Required — WooCommerce has no "current customer" concept under ck/cs. */
  user?: string
}

/** Contract: Omit<Address, 'id' | 'createdAt' | 'updatedAt' | 'active'>. `id` is accepted as an optional slot hint. */
export type CreateAddressParams = Omit<WooAddress, 'id' | 'createdAt' | 'updatedAt' | 'active'> & { id?: string }
export type UpdateAddressParams = Partial<Omit<WooAddress, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>

type Slot = 'billing' | 'shipping'

/**
 * AddressService — WooCommerce. Signatures mirror the storefront contract.
 *
 * WooCommerce has NO address book. A customer record carries exactly ONE `billing`
 * object and ONE `shipping` object
 * (docs: https://woocommerce.github.io/woocommerce-rest-api-docs/#customer-properties),
 * so this service synthesises a two-entry address book over
 * `GET/PUT /wp-json/wc/v3/customers/{id}` using ids of the form `<customerId>:billing`
 * and `<customerId>:shipping`. There is no /customers/{id}/addresses route.
 */
export class AddressService extends BaseService {
  private static instance: AddressService
  static getInstance(): AddressService { if (!AddressService.instance) AddressService.instance = new AddressService(); return AddressService.instance }

  /** Split a synthetic `<customerId>:<slot>` id. A bare id is treated as the billing slot. */
  private parseId(id: string): { customerId: string; slot: Slot } {
    const s = String(id ?? '')
    const i = s.lastIndexOf(':')
    if (i < 0) return { customerId: s, slot: 'billing' }
    return { customerId: s.slice(0, i), slot: s.slice(i + 1) === 'shipping' ? 'shipping' : 'billing' }
  }

  private customerPath(customerId: string): string {
    return `/customers/${encodeURIComponent(customerId)}`
  }

  /** WooCommerce customer.billing / customer.shipping -> WooAddress. */
  private toAddress(c: any, slot: Slot): WooAddress {
    const a = (slot === 'billing' ? c?.billing : c?.shipping) || {}
    return {
      id: `${c?.id ?? ''}:${slot}`,
      active: true,
      address_1: a.address_1 || null,
      address_2: a.address_2 || null,
      city: a.city || null,
      // WooCommerce stores the country as an ISO-3166-1 alpha-2 code in both fields.
      country: a.country || null,
      countryCode: a.country || null,
      // No delivery-instructions, geolocation, locality or residential flag exist on a WC address.
      deliveryInstructions: null,
      // Read ONLY the slot — never fall back to the customer root (first_name/last_name/
      // email). Falling back would fabricate a shipping address for customers who have
      // none, and would make deleteAddress() look like a no-op (the blanked slot would
      // still report a name + email).
      email: a.email || null,
      firstName: a.first_name || null,
      isPrimary: slot === 'billing',
      isResidential: false,
      lastName: a.last_name || null,
      lat: null,
      lng: null,
      locality: null,
      // `phone` and `email` only exist on the billing object.
      phone: a.phone || null,
      state: a.state || null,
      userId: c?.id != null ? String(c.id) : null,
      zip: a.postcode || null,
      createdAt: c?.date_created_gmt || c?.date_created || '',
      updatedAt: c?.date_modified_gmt || c?.date_modified || ''
    }
  }

  /**
   * WooAddress -> WooCommerce billing/shipping body. Only defined keys are emitted:
   * PUT /customers/{id} merges, so omitted fields (e.g. `company`) keep their value.
   */
  private toWooAddress(a: UpdateAddressParams, slot: Slot): Record<string, unknown> {
    const out: Record<string, unknown> = {}
    const put = (key: string, v: unknown) => { if (v !== undefined) out[key] = v ?? '' }
    put('first_name', a.firstName)
    put('last_name', a.lastName)
    put('address_1', a.address_1)
    put('address_2', a.address_2)
    put('city', a.city)
    put('state', a.state)
    put('postcode', a.zip)
    put('country', a.country ?? a.countryCode)
    if (slot === 'billing') {
      put('email', a.email)
      put('phone', a.phone)
    }
    return out
  }

  /**
   * Lists the (at most two) addresses on a WooCommerce customer.
   *
   * `user` must be the WooCommerce customer id — without it there is no current-user
   * concept under a ck/cs key, so an empty page is returned rather than a fabricated one.
   * There is nothing to paginate or sort: count is honestly 0 or 2.
   */
  async list(params: ListAddressesParams = {}): Promise<PaginatedResponse<WooAddress>> {
    const { page = 1, q = '', sort = '', user = '' } = params
    void q; void sort // WooCommerce cannot search or sort a two-slot address book.
    if (!user) return { data: [], count: 0, pageSize: 0, noOfPage: 0, page }
    const c = await this.get<any>(this.customerPath(user))
    const all: WooAddress[] = [this.toAddress(c, 'billing'), this.toAddress(c, 'shipping')]
    // There is exactly one page. Anything past it is empty rather than a repeat of page 1,
    // and the requested page number is echoed back so callers can detect the end.
    return { data: page > 1 ? [] : all, count: all.length, pageSize: all.length, noOfPage: 1, page }
  }

  /** Fetches one slot. `id` is `<customerId>:billing` or `<customerId>:shipping`. */
  async fetchAddress(id: string): Promise<WooAddress> {
    const { customerId, slot } = this.parseId(id)
    if (!customerId) throw new Error('AddressService.fetchAddress: id must be "<customerId>:billing" or "<customerId>:shipping".')
    const c = await this.get<any>(this.customerPath(customerId))
    return this.toAddress(c, slot)
  }

  /**
   * UPSERT of a single slot — NOT a create. WooCommerce has no second billing or
   * shipping address, so this silently overwrites whatever is already in the slot
   * and returns the same synthetic id. Slot is taken from `address.id` when given,
   * otherwise from `isPrimary` (true -> billing, false -> shipping).
   */
  async saveAddress(address: CreateAddressParams): Promise<WooAddress> {
    const customerId = address.id ? this.parseId(address.id).customerId : String(address.userId ?? '')
    if (!customerId) throw new Error('AddressService.saveAddress: address.userId (the WooCommerce customer id) is required — WooCommerce has no current-user address endpoint.')
    const slot: Slot = address.id ? this.parseId(address.id).slot : (address.isPrimary === false ? 'shipping' : 'billing')
    const c = await this.put<any>(this.customerPath(customerId), { [slot]: this.toWooAddress(address, slot) })
    return this.toAddress(c, slot)
  }

  /** Identical call to saveAddress; `id` only selects the billing vs shipping slot. */
  async editAddress(id: string, address: UpdateAddressParams): Promise<WooAddress> {
    const { customerId, slot } = this.parseId(id)
    if (!customerId) throw new Error('AddressService.editAddress: id must be "<customerId>:billing" or "<customerId>:shipping".')
    const c = await this.put<any>(this.customerPath(customerId), { [slot]: this.toWooAddress(address, slot) })
    return this.toAddress(c, slot)
  }

  /**
   * WooCommerce has no address-delete endpoint, so the only honest implementation is
   * to blank every field of the slot. DELETE /customers/{id} removes the whole USER
   * and is deliberately never called here.
   */
  async deleteAddress(id: string): Promise<void> {
    const { customerId, slot } = this.parseId(id)
    if (!customerId) throw new Error('AddressService.deleteAddress: id must be "<customerId>:billing" or "<customerId>:shipping".')
    const blank: Record<string, unknown> = {
      first_name: '', last_name: '', company: '', address_1: '', address_2: '',
      city: '', state: '', postcode: '', country: ''
    }
    if (slot === 'billing') { blank.email = ''; blank.phone = '' }
    await this.put(this.customerPath(customerId), { [slot]: blank })
  }
}

export const addressService = AddressService.getInstance()
