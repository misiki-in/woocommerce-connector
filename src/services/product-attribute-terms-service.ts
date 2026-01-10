import { BaseService } from './base-service'

export interface ProductAttributeTerm {
  id: number
  name: string
  slug: string
  description: string
  menu_order: number
  count: number
}

type ProductAttributeTermListResponse = ProductAttributeTerm[]
type ProductAttributeTermResponse = ProductAttributeTerm

export class ProductAttributeTermsService extends BaseService {
  private static instance: ProductAttributeTermsService

  static getInstance(): ProductAttributeTermsService {
    if (!ProductAttributeTermsService.instance) {
      ProductAttributeTermsService.instance = new ProductAttributeTermsService()
    }
    return ProductAttributeTermsService.instance
  }

  /**
   * List all terms for a product attribute
   * @param attributeId - The attribute ID
   * @param page - Page number (default: 1)
   * @param perPage - Items per page (default: 10)
   * @param hideEmpty - Whether to hide empty terms (default: false)
   * @returns Paginated list of product attribute terms
   */
  async list({ attributeId, page = 1, perPage = 10, hideEmpty = false }: { attributeId: number; page?: number; perPage?: number; hideEmpty?: boolean } = { attributeId: 0 }) {
    try {
      const searchParams = new URLSearchParams()
      searchParams.set('page', page.toString())
      searchParams.set('per_page', perPage.toString())
      searchParams.set('hide_empty', hideEmpty.toString())

      const terms = await this.get<ProductAttributeTermListResponse>(`/products/attributes/${attributeId}/terms?${searchParams.toString()}`)
      
      return {
        terms,
        count: terms.length,
        pagination: this.getPaginationHeaders()
      }
    } catch (error) {
      console.error('Error fetching product attribute terms:', error)
      throw error
    }
  }

  /**
   * Get a single product attribute term by ID
   * @param attributeId - The attribute ID
   * @param termId - The term ID
   * @returns Product attribute term details
   */
  async getOne(attributeId: number, termId: number) {
    try {
      const term = await this.get<ProductAttributeTermResponse>(`/products/attributes/${attributeId}/terms/${termId}`)
      return term
    } catch (error) {
      console.error('Error fetching product attribute term:', error)
      throw error
    }
  }

  /**
   * Create a new product attribute term
   * @param attributeId - The attribute ID
   * @param data - Term data to create
   * @returns Created term
   */
  async create(attributeId: number, data: { name: string; slug?: string; description?: string; menu_order?: number }) {
    try {
      const term = await this.post<ProductAttributeTermResponse>(`/products/attributes/${attributeId}/terms`, data)
      return term
    } catch (error) {
      console.error('Error creating product attribute term:', error)
      throw error
    }
  }

  /**
   * Update a product attribute term
   * @param attributeId - The attribute ID
   * @param termId - The term ID
   * @param data - Term data to update
   * @returns Updated term
   */
  async update(attributeId: number, termId: number, data: Partial<{ name: string; slug: string; description: string; menu_order: number }>) {
    try {
      const term = await this.put<ProductAttributeTermResponse>(`/products/attributes/${attributeId}/terms/${termId}`, data)
      return term
    } catch (error) {
      console.error('Error updating product attribute term:', error)
      throw error
    }
  }

  /**
   * Delete a product attribute term
   * @param attributeId - The attribute ID
   * @param termId - The term ID
   * @param force - Whether to force delete (default: false)
   * @returns Deleted term
   */
  async delete(attributeId: number, termId: number, force = false) {
    try {
      const term = await this.delete<ProductAttributeTermResponse>(`/products/attributes/${attributeId}/terms/${termId}?force=${force}`)
      return term
    } catch (error) {
      console.error('Error deleting product attribute term:', error)
      throw error
    }
  }
}

export const productAttributeTermsService = ProductAttributeTermsService.getInstance()
