import type { PaginatedResponse } from '../types'
import { BaseService } from './base-service'
import { PAGE_SIZE } from '../config'

/**
 * WooCommerce Tax Rate
 */
export interface WooCommerceTaxRate {
  id: number
  country: string
  state: string
  postcode: string
  city: string
  rate: string
  name: string
  priority: number
  compound: boolean
  shipping: boolean
  order: number
  class: string
}

/**
 * WooCommerce Tax Class
 */
export interface WooCommerceTaxClass {
  slug: string
  name: string
}

/**
 * Extended tax rate type for the application
 */
export interface TaxRate extends Omit<WooCommerceTaxRate, 'id'> {
  id: string
}

/**
 * TaxService provides functionality for working with WooCommerce tax rates and classes
 *
 * WooCommerce REST API: /wp-json/wc/v3/taxes
 *
 * This service helps with:
 * - Fetching tax rates from WooCommerce
 * - Managing tax classes
 * - Creating and updating tax rates
 */
export class TaxService extends BaseService {
  private static instance: TaxService

  /**
   * Get the singleton instance
   *
   * @returns {TaxService} The singleton instance of TaxService
   */
  static getInstance(): TaxService {
    if (!TaxService.instance) {
      TaxService.instance = new TaxService()
    }
    return TaxService.instance
  }

  /**
   * Fetches tax rates from WooCommerce with optional filtering
   *
   * @param {Object} options - The request options
   * @param {number} [options.page=1] - The page number for pagination
   * @param {number} [options.perPage=100] - Number of tax rates per page
   * @param {string} [options.country=''] - Filter by country code
   * @param {string} [options.state=''] - Filter by state code
   * @param {string} [options.postcode=''] - Filter by postcode
   * @param {string} [options.taxClass=''] - Filter by tax class
   * @returns {Promise<PaginatedResponse<TaxRate>>} Paginated list of tax rates
   * @api {get} /wp-json/wc/v3/taxes List all tax rates
   *
   * @example
   * // Get all tax rates
   * const rates = await taxService.listRates({ page: 1 });
   */
  async listRates(options: {
    page?: number
    perPage?: number
    country?: string
    state?: string
    postcode?: string
    taxClass?: string
  } = {}): Promise<PaginatedResponse<TaxRate>> {
    const {
      page = 1,
      perPage = 100,
      country = '',
      state = '',
      postcode = '',
      taxClass = ''
    } = options

    const searchParams = new URLSearchParams()
    searchParams.set('page', page.toString())
    searchParams.set('per_page', perPage.toString())
    if (country) searchParams.set('country', country)
    if (state) searchParams.set('state', state)
    if (postcode) searchParams.set('postcode', postcode)
    if (taxClass) searchParams.set('class', taxClass)

    const rates = await this.get<WooCommerceTaxRate[]>(
      `/wp-json/wc/v3/taxes?${searchParams.toString()}`
    )

    return {
      page,
      pageSize: perPage,
      count: rates.length,
      data: rates.map(rate => ({
        ...rate,
        id: rate.id.toString()
      })),
      noOfPage: Math.ceil(rates.length / perPage)
    }
  }

  /**
   * Fetches a single tax rate by ID
   *
   * @param {string} id - The tax rate ID
   * @returns {Promise<TaxRate>} The tax rate
   * @api {get} /wp-json/wc/v3/taxes/:id Get tax rate by ID
   *
   * @example
   * // Get a specific tax rate
   * const rate = await taxService.getRate('1');
   */
  async getRate(id: string): Promise<TaxRate> {
    const rate = await this.get<WooCommerceTaxRate>(
      `/wp-json/wc/v3/taxes/${id}`
    )
    return {
      ...rate,
      id: rate.id.toString()
    }
  }

  /**
   * Creates a new tax rate
   *
   * @param {Object} data - The tax rate data to create
   * @returns {Promise<TaxRate>} The created tax rate
   * @api {post} /wp-json/wc/v3/taxes Create tax rate
   *
   * @example
   * // Create a new tax rate
   * const newRate = await taxService.createRate({
   *   country: 'US',
   *   state: 'CA',
   *   rate: '7.25',
   *   name: 'California Sales Tax',
   *   priority: 1,
   *   compound: false,
   *   shipping: true
   * });
   */
  async createRate(data: {
    country: string
    state?: string
    postcode?: string
    city?: string
    rate: string
    name: string
    priority?: number
    compound?: boolean
    shipping?: boolean
    order?: number
    class?: string
  }): Promise<TaxRate> {
    const rate = await this.post<WooCommerceTaxRate>(
      '/wp-json/wc/v3/taxes',
      data
    )
    return {
      ...rate,
      id: rate.id.toString()
    }
  }

  /**
   * Updates an existing tax rate
   *
   * @param {string} id - The tax rate ID to update
   * @param {Object} data - The tax rate data to update
   * @returns {Promise<TaxRate>} The updated tax rate
   * @api {put} /wp-json/wc/v3/taxes/:id Update tax rate
   *
   * @example
   * // Update a tax rate
   * const updated = await taxService.updateRate('1', {
   *   rate: '8.0',
   *   name: 'Updated Tax Name'
   * });
   */
  async updateRate(
    id: string,
    data: {
      country?: string
      state?: string
      postcode?: string
      city?: string
      rate?: string
      name?: string
      priority?: number
      compound?: boolean
      shipping?: boolean
      order?: number
      class?: string
    }
  ): Promise<TaxRate> {
    const rate = await this.put<WooCommerceTaxRate>(
      `/wp-json/wc/v3/taxes/${id}`,
      data
    )
    return {
      ...rate,
      id: rate.id.toString()
    }
  }

  /**
   * Deletes a tax rate
   *
   * @param {string} id - The tax rate ID to delete
   * @param {boolean} [force=false] - Whether to force delete (bypass trash)
   * @returns {Promise<{ deleted: boolean }>} The deletion result
   * @api {delete} /wp-json/wc/v3/taxes/:id Delete tax rate
   *
   * @example
   * // Delete a tax rate
   * await taxService.deleteRate('1', true);
   */
  async deleteRate(id: string, force: boolean = false): Promise<{ deleted: boolean }> {
    const result = await this.delete<{ deleted: boolean }>(
      `/wp-json/wc/v3/taxes/${id}?force=${force}`
    )
    return result
  }

  /**
   * Fetches all tax classes
   *
   * @returns {Promise<WooCommerceTaxClass[]>} List of tax classes
   * @api {get} /wp-json/wc/v3/taxes/classes List tax classes
   *
   * @example
   * // Get all tax classes
   * const classes = await taxService.listTaxClasses();
   */
  async listTaxClasses(): Promise<WooCommerceTaxClass[]> {
    const classes = await this.get<WooCommerceTaxClass[]>(
      '/wp-json/wc/v3/taxes/classes'
    )
    return classes
  }

  /**
   * Creates a new tax class
   *
   * @param {Object} data - The tax class data to create
   * @returns {Promise<WooCommerceTaxClass>} The created tax class
   * @api {post} /wp-json/wc/v3/taxes/classes Create tax class
   *
   * @example
   * // Create a new tax class
   * const newClass = await taxService.createTaxClass({
   *   name: 'Reduced Rate',
   *   slug: 'reduced-rate'
   * });
   */
  async createTaxClass(data: {
    name: string
    slug?: string
  }): Promise<WooCommerceTaxClass> {
    const taxClass = await this.post<WooCommerceTaxClass>(
      '/wp-json/wc/v3/taxes/classes',
      data
    )
    return taxClass
  }

  /**
   * Deletes a tax class
   *
   * @param {string} slug - The tax class slug to delete
   * @returns {Promise<{ deleted: boolean }>} The deletion result
   * @api {delete} /wp-json/wc/v3/taxes/classes/:slug Delete tax class
   *
   * @example
   * // Delete a tax class
   * await taxService.deleteTaxClass('reduced-rate');
   */
  async deleteTaxClass(slug: string): Promise<{ deleted: boolean }> {
    const result = await this.delete<{ deleted: boolean }>(
      `/wp-json/wc/v3/taxes/classes/${slug}`
    )
    return result
  }

  /**
   * Batch create, update, and delete tax rates
   *
   * @param {Object} data - The batch operations data
   * @returns {Promise<any>} The batch operation result
   * @api {post} /wp-json/wc/v3/taxes/batch Batch operations
   *
   * @example
   * // Batch create tax rates
   * await taxService.batch({
   *   create: [{ country: 'US', state: 'NY', rate: '8.0', name: 'NY Tax' }]
   * });
   */
  async batch(data: {
    create?: Array<{
      country: string
      state?: string
      postcode?: string
      city?: string
      rate: string
      name: string
      priority?: number
      compound?: boolean
      shipping?: boolean
      order?: number
      class?: string
    }>
    update?: Array<{
      id: string
      country?: string
      state?: string
      postcode?: string
      city?: string
      rate?: string
      name?: string
      priority?: number
      compound?: boolean
      shipping?: boolean
      order?: number
      class?: string
    }>
    delete?: string[]
  }): Promise<any> {
    return this.post('/wp-json/wc/v3/taxes/batch', data)
  }

  /**
   * Calculates tax for a given price and location
   *
   * @param {Object} params - The calculation parameters
   * @param {number} params.price - The price to calculate tax for
   * @param {string} params.country - The country code
   * @param {string} [params.state] - The state code
   * @param {string} [params.postcode] - The postcode
   * @param {string} [params.city] - The city
   * @param {string} [params.taxClass] - The tax class
   * @returns {Promise<{ subtotal: number; tax: number; total: number }>} Calculated tax amounts
   *
   * @example
   * // Calculate tax for $100 in California
   * const tax = await taxService.calculateTax({
   *   price: 100,
   *   country: 'US',
   *   state: 'CA'
   * });
   */
  async calculateTax(params: {
    price: number
    country: string
    state?: string
    postcode?: string
    city?: string
    taxClass?: string
  }): Promise<{ subtotal: number; tax: number; total: number }> {
    const searchParams = new URLSearchParams()
    searchParams.set('price', params.price.toString())
    searchParams.set('country', params.country)
    if (params.state) searchParams.set('state', params.state)
    if (params.postcode) searchParams.set('postcode', params.postcode)
    if (params.city) searchParams.set('city', params.city)
    if (params.taxClass) searchParams.set('class', params.taxClass)

    const result = await this.get<{ subtotal: number; tax: number; total: number }>(
      `/wp-json/wc/v3/taxes/calculate?${searchParams.toString()}`
    )
    return result
  }
}

// Use singleton instance
export const taxService = TaxService.getInstance()
