<<<<<<< HEAD
import type { Address } from '../types'
import { BaseService } from './base-service'
import { PaginatedResponse } from '../types/api-response'
import { PAGE_SIZE } from '../config'

type WooCommerceAddress = {
  id: number
  first_name: string
  last_name: string
  company: string
  address_1: string
  address_2: string
  city: string
  state: string
  postcode: string
  country: string
  email: string
  phone: string
}

export function transformFromAddress(address: Partial<Address>) {
  if (!address) return address
  return {
    first_name: address.firstName,
    last_name: address.lastName,
    company: address.company,
    address_1: address.address_1 || address.address1,
    address_2: address.address_2 || address.address2,
    city: address.city,
    state: address.state,
    postcode: address.zip,
    country: address.countryCode?.toUpperCase?.() || address.country,
    email: address.email,
    phone: address.phone
  }
}

export function transformIntoAddress(address: WooCommerceAddress): Address {
  if (!address) return {} as Address
  return {
    id: address.id.toString(),
    active: true,
    firstName: address.first_name,
    lastName: address.last_name,
    company: address.company,
    address1: address.address_1,
    address2: address.address_2,
    city: address.city,
    state: address.state,
    zip: address.postcode,
    country: address.country,
    countryCode: address.country,
    email: address.email,
    phone: address.phone
  }
}

/**
 * AddressService provides functionality for managing user addresses
 * in the WooCommerce platform.
 *
 * Note: WooCommerce Store API's customer addresses endpoints require
 * authentication via WordPress nonces. For full functionality, ensure
 * your WordPress installation has the WooCommerce Store API enabled
 * and proper authentication is set up.
 */
export class AddressService extends BaseService {
  private static instance: AddressService

  /**
   * Get the singleton instance
   *
   * @returns {AddressService} The singleton instance of AddressService
   */
=======
import { BaseService } from './base-service.js'
import type { Address } from '../types/index.js'

export class AddressService extends BaseService {
  private static instance: AddressService

>>>>>>> f348a1b (feat: product listing)
  static getInstance(): AddressService {
    if (!AddressService.instance) {
      AddressService.instance = new AddressService()
    }
    return AddressService.instance
  }

<<<<<<< HEAD
  /**
   * Fetches a paginated list of addresses with optional filtering
   *
   * Note: WooCommerce Store API doesn't provide a direct list addresses endpoint.
   * This method simulates it by fetching the customer and extracting addresses.
   *
   * @param {object} options - The options for filtering and pagination
   * @param {number} [options.page=1] - The page number to fetch
   * @param {string} [options.q=''] - Search query for filtering addresses
   * @param {string} [options.sort='-createdAt'] - Sort order for the results
   * @param {string} [options.user=''] - Filter addresses by user ID
   * @returns {Promise<PaginatedResponse<Address>>} Paginated list of addresses
   *
   * @example
   * // Get the second page of addresses sorted by creation date
   * const addresses = await addressService.list({ page: 2, sort: '-createdAt' });
   */
  async list({ page = 1, q = '', sort = '-createdAt', user = '' }) {
    // WooCommerce Store API doesn't have a list addresses endpoint
    // We need to use the WC v3 customers endpoint with authentication
    
    const searchParams = new URLSearchParams()
    searchParams.set('page', page.toString())
    searchParams.set('per_page', String(PAGE_SIZE))
    if (q) {
      searchParams.set('search', q)
    }

    try {
      // Get customer addresses using WC v3 customers/me endpoint
      const customer = await this.get<WooCommerceAddress & { billing: WooCommerceAddress; shipping: WooCommerceAddress }>(
        `/wp-json/wc/v3/customers/me`
      )

      const addresses: Address[] = []
      
      // Add billing address if exists
      if (customer.billing) {
        addresses.push(transformIntoAddress({
          ...customer.billing,
          id: 1,
          email: customer.email || customer.billing.email
        }))
      }
      
      // Add shipping address if exists and different from billing
      if (customer.shipping && JSON.stringify(customer.shipping) !== JSON.stringify(customer.billing)) {
        addresses.push(transformIntoAddress({
          ...customer.shipping,
          id: 2,
          email: customer.email || customer.shipping.email
        }))
      }

      return {
        pageSize: PAGE_SIZE,
        count: addresses.length,
        page,
        data: addresses
      }
    } catch (error) {
      console.error('Error fetching addresses:', error)
      return {
        pageSize: PAGE_SIZE,
        count: 0,
        page,
        data: []
      }
    }
  }

  /**
   * Fetches a single address by ID
   *
   * @param {string} id - The ID of the address to fetch (1 for billing, 2 for shipping)
   * @returns {Promise<Address>} The address data
   *
   * @example
   * // Fetch a specific address
   * const address = await addressService.fetchAddress('1');
   */
  async fetchAddress(id: string): Promise<Address> {
    try {
      const customer = await this.get<WooCommerceAddress & { billing: WooCommerceAddress; shipping: WooCommerceAddress }>(
        `/wp-json/wc/v3/customers/me`
      )

      if (id === '1' || id === 'billing') {
        return transformIntoAddress({
          ...customer.billing,
          id: 1,
          email: customer.email || customer.billing.email
        })
      } else if (id === '2' || id === 'shipping') {
        return transformIntoAddress({
          ...customer.shipping,
          id: 2,
          email: customer.email || customer.shipping.email
        })
      }

      throw new Error('Address not found')
    } catch (error) {
      console.error('Error fetching address:', error)
      throw error
    }
  }

  /**
   * Creates a new address for the current user
   * Note: WooCommerce stores billing and shipping as part of customer data
   *
   * @param {Omit<Address, 'id'>} address - The address data to save
   * @returns {Promise<Address>} The created address with ID
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
  async saveAddress(address: Omit<Address, 'id'>): Promise<Address> {
    try {
      const transformedAddress = transformFromAddress(address)
      
      // Determine if this is billing or shipping based on address type
      // For now, we'll update both billing and shipping
      await this.put(`/wp-json/wc/v3/customers/me`, {
        billing: transformedAddress,
        shipping: transformedAddress
      })

      return {
        ...address,
        id: address.isBilling ? '1' : '2'
      } as Address
    } catch (error) {
      console.error('Error saving address:', error)
      throw error
    }
  }

  /**
   * Updates an existing address
   *
   * @param {string} id - The ID of the address to update (1 for billing, 2 for shipping)
   * @param {Partial<Address>} address - The address fields to update
   * @returns {Promise<Address>} The updated address
   *
   * @example
   * // Update an address
   * const updatedAddress = await addressService.editAddress('1', {
   *   city: 'New City',
   *   zip: '54321'
   * });
   */
  async editAddress(id: string, address: Partial<Address>): Promise<Address> {
    try {
      const transformedAddress = transformFromAddress(address)
      
      const updateData: any = {}
      
      if (id === '1' || id === 'billing') {
        updateData.billing = transformedAddress
      } else if (id === '2' || id === 'shipping') {
        updateData.shipping = transformedAddress
      } else {
        throw new Error('Invalid address ID')
      }

      await this.put(`/wp-json/wc/v3/customers/me`, updateData)

      return {
        ...address,
        id
      } as Address
    } catch (error) {
      console.error('Error updating address:', error)
      throw error
    }
  }

  /**
   * Deletes an address
   * Note: WooCommerce doesn't support deleting addresses directly.
   * This method clears the address data instead.
   *
   * @param {string} id - The ID of the address to delete (1 for billing, 2 for shipping)
   * @returns {Promise<{ deleted: boolean }>} The deletion result
   *
   * @example
   * // Delete an address
   * await addressService.deleteAddress('1');
   */
  async deleteAddress(id: string): Promise<{ deleted: boolean }> {
    try {
      const emptyAddress = {
        first_name: '',
        last_name: '',
        company: '',
        address_1: '',
        address_2: '',
        city: '',
        state: '',
        postcode: '',
        country: '',
        email: '',
        phone: ''
      }

      if (id === '1' || id === 'billing') {
        await this.put(`/wp-json/wc/v3/customers/me`, { billing: emptyAddress })
      } else if (id === '2' || id === 'shipping') {
        await this.put(`/wp-json/wc/v3/customers/me`, { shipping: emptyAddress })
      } else {
        throw new Error('Invalid address ID')
      }

      return { deleted: true }
    } catch (error) {
      console.error('Error deleting address:', error)
      throw error
    }
  }
}

// Use singleton instance
=======
  async list(params: any = {}) {
    // List addresses for a user
    return { data: [], count: 0 }
  }

  async getOne(id: string) {
    // Get a specific address
    return null
  }

  async create(data: Partial<Address>) {
    // Create address
    return null
  }

  async update(id: string, data: Partial<Address>) {
    // Update address
    return null
  }

  async deleteAddress(id: string) {
    // Delete address
  }
}

>>>>>>> f348a1b (feat: product listing)
export const addressService = AddressService.getInstance()
