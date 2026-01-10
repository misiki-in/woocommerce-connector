import type { Address } from '../types'
import { BaseService } from './base-service'
import { PaginatedResponse } from '../types/api-response'
import { PAGE_SIZE } from '../config'

export function transformFromAddress(address: Partial<Address>) {
  if (!address)
    return address
  return {
    phone: address.phone,
    address_1: address.address_1,
    address_2: address.address_2,
    city: address.city,
    first_name: address.firstName,
    last_name: address.lastName,
    postal_code: address.zip,
    country_code: address.countryCode?.toLowerCase?.(),
    metadata: {
      state: address.state
    }
  }

}

export function transformIntoAddress(address: any): Address {
  if (!address)
    return address
  return {
    ...address,
    active: true,
    state: address?.metadata?.state || null,
    firstName: address?.first_name || null,
    lastName: address?.last_name || null,
    zip: address?.postal_code || null,
    countryCode: address?.country_code?.toUpperCase?.() || null,
  }
}
/**
 * AddressService provides functionality for managing user addresses
 * in the e-commerce platform.
 *
 * This service helps with:
 * - Retrieving user addresses with pagination and filtering
 * - Creating new addresses for the current user
 * - Updating existing address information
 * - Deleting addresses that are no longer needed
 */
export class AddressService extends BaseService {
  private static instance: AddressService

  /**
   * Get the singleton instance
   *
   * @returns {AddressService} The singleton instance of AddressService
   */
  static getInstance(): AddressService {
    if (!AddressService.instance) {
      AddressService.instance = new AddressService()
    }
    return AddressService.instance
  }

  /**
   * Fetches a paginated list of addresses with optional filtering
   *
   * @param {object} options - The options for filtering and pagination
   * @param {number} [options.page=1] - The page number to fetch
   * @param {string} [options.q=''] - Search query for filtering addresses
   * @param {string} [options.sort='-createdAt'] - Sort order for the results
   * @param {string} [options.user=''] - Filter addresses by user ID
   * @returns {Promise<PaginatedResponse<Address>>} Paginated list of addresses
   * @api {get} /api/address List addresses
   *
   * @example
   * // Get the second page of addresses sorted by creation date
   * const addresses = await addressService.list({ page: 2, sort: '-createdAt' });
   */
  async list({ page = 1, q = '', sort = '-createdAt', user = '' }) {
    const searchParams = new URLSearchParams()
    searchParams.set('offset', ((page - 1) * PAGE_SIZE).toString())
    searchParams.set('limit', String(PAGE_SIZE))
    searchParams.set('q', q)

    const res = await this.get<any>(
      `/store/customers/me/addresses?` + searchParams.toString(),
    )

    return {
      pageSize: PAGE_SIZE,
      count: res.count,
      page,
      data: res.addresses.map(transformIntoAddress),
    }
  }

  /**
   * Fetches a single address by ID
   *
   * @param {string} id - The ID of the address to fetch
   * @returns {Promise<Address>} The address data
   * @api {get} /api/address/:id Get address by ID
   *
   * @example
   * // Fetch a specific address
   * const address = await addressService.fetchAddress('123');
   */
  async fetchAddress(id: string): Promise<Address> {
    const res = await this.get<Address>(`/store/customers/me/addresses/${id}`)
    return transformIntoAddress(res)
  }

  /**
   * Creates a new address for the current user
   *
   * @param {Omit<Address, 'id'>} address - The address data to save
   * @returns {Promise<Address>} The created address with ID
   * @api {post} /api/address/me Create new address
   *
   * @example
   * // Create a new address
   * const newAddress = await addressService.saveAddress({
   *   firstName: 'John',
   *   lastName: 'Doe',
   *   address: '123 Main St',
   *   city: 'Anytown',
   *   zip: '12345',
   *   country: 'US'
   * });
   */
  async saveAddress(address: Address) {
    if (address.id && address.id != 'new')
      return this.editAddress(address.id, address)
    return this.post('/store/customers/me/addresses', transformFromAddress(address)) as Promise<Address>
  }

  /**
   * Updates an existing address
   *
   * @param {string} id - The ID of the address to update
   * @param {Partial<Address>} address - The address fields to update
   * @returns {Promise<Address>} The updated address
   * @api {put} /api/address/me/:id Update address
   *
   * @example
   * // Update an address
   * const updatedAddress = await addressService.editAddress('123', {
   *   city: 'New City',
   *   zip: '54321'
   * });
   */
  async editAddress(id: string, address: Partial<Address>) {
    return this.post(`/store/customers/me/addresses/${id}`, transformFromAddress(address)) as Promise<Address>
  }

  /**
   * Deletes an address
   *
   * @param {string} id - The ID of the address to delete
   * @returns {Promise<any>} The deletion response
   * @api {delete} /api/address/:id Delete address
   *
   * @example
   * // Delete an address
   * await addressService.deleteAddress('123');
   */
  async deleteAddress(id: string) {
    return this.delete(`/store/customers/me/addresses/${id}`)
  }
}

// Use singleton instance
export const addressService = AddressService.getInstance()

