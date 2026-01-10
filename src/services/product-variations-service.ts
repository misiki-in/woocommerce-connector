import { BaseService } from './base-service'

export interface ProductVariation {
  id: number
  date_created: string
  date_created_gmt: string
  date_modified: string
  date_modified_gmt: string
  description: string
  permalink: string
  sku: string
  price: string
  regular_price: string
  sale_price: string
  date_on_sale_from: string
  date_on_sale_from_gmt: string
  date_on_sale_to: string
  date_on_sale_to_gmt: string
  on_sale: boolean
  status: string
  purchasable: boolean
  virtual: boolean
  downloadable: boolean
  downloads: ProductVariationDownload[]
  download_limit: number
  download_expiry: number
  tax_status: string
  tax_class: string
  manage_stock: boolean
  stock_quantity: number | null
  stock_status: 'instock' | 'outofstock' | 'onbackorder'
  backorders: 'no' | 'notify' | 'allow'
  backorders_allowed: boolean
  backordered: boolean
  low_stock_amount: number | null
  weight: string
  dimensions: {
    length: string
    width: string
    height: string
  }
  shipping_class: string
  shipping_class_id: number
  image: ProductVariationImage | null
  attributes: ProductVariationAttribute[]
  menu_order: number
  meta_data: MetaData[]
}

export interface ProductVariationDownload {
  id: string
  name: string
  file: string
}

export interface ProductVariationImage {
  id: number
  date_created: string
  date_created_gmt: string
  date_modified: string
  date_modified_gmt: string
  src: string
  name: string
  alt: string
}

export interface ProductVariationAttribute {
  id: number
  name: string
  option: string
}

export interface MetaData {
  id: number
  key: string
  value: string
}

type ProductVariationListResponse = ProductVariation[]
type ProductVariationResponse = ProductVariation

export class ProductVariationsService extends BaseService {
  private static instance: ProductVariationsService

  static getInstance(): ProductVariationsService {
    if (!ProductVariationsService.instance) {
      ProductVariationsService.instance = new ProductVariationsService()
    }
    return ProductVariationsService.instance
  }

  /**
   * List all product variations
   * @param productId - The product ID
   * @param page - Page number (default: 1)
   * @param perPage - Items per page (default: 10)
   * @returns Paginated list of product variations
   */
  async list({ productId, page = 1, perPage = 10 }: { productId: number; page?: number; perPage?: number } = { productId: 0 }) {
    try {
      const searchParams = new URLSearchParams()
      searchParams.set('page', page.toString())
      searchParams.set('per_page', perPage.toString())

      const variations = await this.get<ProductVariationListResponse>(`/products/${productId}/variations?${searchParams.toString()}`)
      
      return {
        variations,
        count: variations.length,
        pagination: this.getPaginationHeaders()
      }
    } catch (error) {
      console.error('Error fetching product variations:', error)
      throw error
    }
  }

  /**
   * Get a single product variation by ID
   * @param productId - The product ID
   * @param variationId - The variation ID
   * @returns Product variation details
   */
  async getOne(productId: number, variationId: number) {
    try {
      const variation = await this.get<ProductVariationResponse>(`/products/${productId}/variations/${variationId}`)
      return variation
    } catch (error) {
      console.error('Error fetching product variation:', error)
      throw error
    }
  }

  /**
   * Create a new product variation
   * @param productId - The product ID
   * @param data - Variation data to create
   * @returns Created variation
   */
  async create(productId: number, data: Partial<ProductVariation>) {
    try {
      const variation = await this.post<ProductVariationResponse>(`/products/${productId}/variations`, data)
      return variation
    } catch (error) {
      console.error('Error creating product variation:', error)
      throw error
    }
  }

  /**
   * Update a product variation
   * @param productId - The product ID
   * @param variationId - The variation ID
   * @param data - Variation data to update
   * @returns Updated variation
   */
  async update(productId: number, variationId: number, data: Partial<ProductVariation>) {
    try {
      const variation = await this.put<ProductVariationResponse>(`/products/${productId}/variations/${variationId}`, data)
      return variation
    } catch (error) {
      console.error('Error updating product variation:', error)
      throw error
    }
  }

  /**
   * Delete a product variation
   * @param productId - The product ID
   * @param variationId - The variation ID
   * @param force - Whether to force delete (default: false)
   * @returns Deleted variation
   */
  async delete(productId: number, variationId: number, force = false) {
    try {
      const variation = await this.delete<ProductVariationResponse>(`/products/${productId}/variations/${variationId}?force=${force}`)
      return variation
    } catch (error) {
      console.error('Error deleting product variation:', error)
      throw error
    }
  }

  /**
   * Batch update product variations
   * @param productId - The product ID
   * @param data - Batch update data
   * @returns Batch update result
   */
  async batchUpdate(productId: number, data: { create?: Partial<ProductVariation>[]; update?: Partial<ProductVariation>[]; delete?: number[] }) {
    try {
      const result = await this.post<{ create?: ProductVariation[]; update?: ProductVariation[]; delete?: ProductVariation[] }>(`/products/${productId}/variations/batch`, data)
      return result
    } catch (error) {
      console.error('Error batch updating product variations:', error)
      throw error
    }
  }
}

export const productVariationsService = ProductVariationsService.getInstance()
