import { BaseService } from './base-service'

export interface ProductTag {
  id: number
  name: string
  slug: string
  count: number
}

type ProductTagListResponse = ProductTag[]
type ProductTagResponse = ProductTag

export class ProductTagsService extends BaseService {
  private static instance: ProductTagsService

  static getInstance(): ProductTagsService {
    if (!ProductTagsService.instance) {
      ProductTagsService.instance = new ProductTagsService()
    }
    return ProductTagsService.instance
  }

  /**
   * List all product tags
   * @param page - Page number (default: 1)
   * @param perPage - Items per page (default: 10)
   * @returns Paginated list of product tags
   */
  async list({ page = 1, perPage = 10 } = {}) {
    try {
      const searchParams = new URLSearchParams()
      searchParams.set('page', page.toString())
      searchParams.set('per_page', perPage.toString())

      const tags = await this.get<ProductTagListResponse>(`/products/tags?${searchParams.toString()}`)
      
      return {
        tags,
        count: tags.length,
        pagination: this.getPaginationHeaders()
      }
    } catch (error) {
      console.error('Error fetching product tags:', error)
      throw error
    }
  }

  /**
   * Get a single product tag by ID
   * @param id - Tag ID
   * @returns Product tag details
   */
  async getOne(id: number) {
    try {
      const tag = await this.get<ProductTagResponse>(`/products/tags/${id}`)
      return tag
    } catch (error) {
      console.error('Error fetching product tag:', error)
      throw error
    }
  }

  /**
   * Create a new product tag
   * @param data - Tag data to create
   * @returns Created tag
   */
  async create(data: { name: string; slug?: string; description?: string }) {
    try {
      const tag = await this.post<ProductTagResponse>('/products/tags', data)
      return tag
    } catch (error) {
      console.error('Error creating product tag:', error)
      throw error
    }
  }

  /**
   * Update a product tag
   * @param id - Tag ID
   * @param data - Tag data to update
   * @returns Updated tag
   */
  async update(id: number, data: Partial<{ name: string; slug: string; description: string }>) {
    try {
      const tag = await this.put<ProductTagResponse>(`/products/tags/${id}`, data)
      return tag
    } catch (error) {
      console.error('Error updating product tag:', error)
      throw error
    }
  }

  /**
   * Delete a product tag
   * @param id - Tag ID
   * @param force - Whether to force delete (default: false)
   * @returns Deleted tag
   */
  async delete(id: number, force = false) {
    try {
      const tag = await this.delete<ProductTagResponse>(`/products/tags/${id}?force=${force}`)
      return tag
    } catch (error) {
      console.error('Error deleting product tag:', error)
      throw error
    }
  }
}

export const productTagsService = ProductTagsService.getInstance()
