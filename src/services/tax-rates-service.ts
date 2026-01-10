import { BaseService } from './base-service'

export interface TaxRate {
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

export interface TaxRateBatch {
  create: TaxRate[]
  update: TaxRate[]
  delete: number[]
}

export interface TaxRateListParams {
  context?: 'view' | 'edit'
  page?: number
  per_page?: number
  offset?: number
  order?: 'asc' | 'desc'
  orderby?: 'id' | 'country' | 'state' | 'priority' | 'rate' | 'name' | 'class'
  tax_class?: string
}

type TaxRateResponse = TaxRate
type TaxRateListResponse = TaxRate[]
type TaxRateCreateResponse = TaxRate
type TaxRateUpdateResponse = TaxRate
type TaxRateDeleteResponse = { id: number; deleted: boolean }

export class TaxRatesService extends BaseService {
  private static instance: TaxRatesService

  static getInstance(): TaxRatesService {
    if (!TaxRatesService.instance) {
      TaxRatesService.instance = new TaxRatesService()
    }
    return TaxRatesService.instance
  }

  /**
   * List all tax rates
   * @param params Query parameters for filtering
   * @returns List of tax rates
   */
  async list(params?: TaxRateListParams) {
    try {
      const rates = await this.get<TaxRateListResponse>('/taxes', params)
      return rates
    } catch (error) {
      console.error('Error fetching tax rates:', error)
      throw error
    }
  }

  /**
   * Get a single tax rate
   * @param id Tax rate ID
   * @param context Context (view or edit)
   * @returns Tax rate details
   */
  async get(id: number, context?: 'view' | 'edit') {
    try {
      const rate = await this.get<TaxRateResponse>(`/taxes/${id}`, context ? { context } : undefined)
      return rate
    } catch (error) {
      console.error(`Error fetching tax rate ${id}:`, error)
      throw error
    }
  }

  /**
   * Create a new tax rate
   * @param data Tax rate data
   * @returns Created tax rate
   */
  async create(data: Partial<TaxRate>) {
    try {
      const rate = await this.post<TaxRateCreateResponse>('/taxes', data)
      return rate
    } catch (error) {
      console.error('Error creating tax rate:', error)
      throw error
    }
  }

  /**
   * Update a tax rate
   * @param id Tax rate ID
   * @param data Tax rate data to update
   * @returns Updated tax rate
   */
  async update(id: number, data: Partial<TaxRate>) {
    try {
      const rate = await this.put<TaxRateUpdateResponse>(`/taxes/${id}`, data)
      return rate
    } catch (error) {
      console.error(`Error updating tax rate ${id}:`, error)
      throw error
    }
  }

  /**
   * Delete a tax rate
   * @param id Tax rate ID
   * @param force Force delete (not applicable for tax rates, always true)
   * @returns Deleted tax rate ID
   */
  async delete(id: number, force?: boolean) {
    try {
      const result = await this.delete_<TaxRateDeleteResponse>(`/taxes/${id}`, force ? { force: true } : undefined)
      return result
    } catch (error) {
      console.error(`Error deleting tax rate ${id}:`, error)
      throw error
    }
  }

  /**
   * Batch create, update, and delete tax rates
   * @param data Batch operations
   * @returns Created, updated, and deleted tax rates
   */
  async batch(data: TaxRateBatch) {
    try {
      const result = await this.post<{
        create: TaxRate[]
        update: TaxRate[]
        delete: TaxRateDeleteResponse[]
      }>('/taxes/batch', data)
      return result
    } catch (error) {
      console.error('Error batch processing tax rates:', error)
      throw error
    }
  }
}

export const taxRatesService = TaxRatesService.getInstance()
