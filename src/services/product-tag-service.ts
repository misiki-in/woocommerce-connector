import type { PaginatedResponse } from '../types'
import { BaseService } from './base-service'
import { PAGE_SIZE } from '../config'

/**
 * WooCommerce Product Tag
 * @see https://woocommerce.github.io/woocommerce-rest-api-docs/#product-tags
 */
export interface WooCommerceProductTag {
  id: number
  name: string
  slug: string
  description: string
  count: number
}

/**
 * ProductTag type for the application
 */
export interface ProductTag extends Omit<WooCommerceProductTag, 'id'> {
  id: string
}

/**
 * ProductTagService provides functionality for working with WooCommerce product tags
 *
 * WooCommerce REST API: /wp-json/wc/v3/products/tags
 *
 * This service helps with:
 * - Fetching product tags from WooCommerce
 * - Creating and updating product tags
 * - Managing product tag associations
 */
export class ProductTagService extends BaseService {
  private static instance: ProductTagService

  /**
   * Get the singleton instance
   *
   * @returns {ProductTagService} The singleton instance of ProductTagService
   */
  static getInstance(): ProductTagService {
    if (!ProductTagService.instance) {
      ProductTagService.instance = new ProductTagService()
    }
    return ProductTagService.instance
  }

  /**
   * Fetches all product tags from WooCommerce
   *
   * @param {Object} options - The request options
   * @param {number} [options.page=1] - The page number for pagination
   * @param {number} [options.perPage=100] - Number of tags per page
   * @param {string} [options.search] - Search term to filter tags
   * @param {boolean} [options.hideEmpty=false] - Whether to hide empty tags
   * @returns {Promise<PaginatedResponse<ProductTag>>} Paginated list of product tags
   * @api {get} /wp-json/wc/v3/products/tags List all product tags
   *
   * @example
   * // Get all product tags
   * const tags = await productTagService.list({ page: 1 });
   *
   * @example
   * // Search for tags
   * const tags = await productTagService.list({ search: 'sale' });
   */
  async list(options: {
    page?: number
    perPage?: number
    search?: string
    hideEmpty?: boolean
  } = {}): Promise<PaginatedResponse<ProductTag>> {
    const { page = 1, perPage = PAGE_SIZE, search, hideEmpty = false } = options

    const searchParams = new URLSearchParams()
    searchParams.set('page', page.toString())
    searchParams.set('per_page', perPage.toString())
    searchParams.set('hide_empty', hideEmpty.toString())
    if (search) {
      searchParams.set('search', search)
    }

    const tags = await this.get<WooCommerceProductTag[]>(
      `/wp-json/wc/v3/products/tags?${searchParams.toString()}`
    )

    return {
      page,
      pageSize: perPage,
      count: tags.length,
      data: tags.map(tag => ({
        ...tag,
        id: tag.id.toString()
      })),
      noOfPage: Math.ceil(tags.length / perPage)
    }
  }

  /**
   * Fetches a single product tag by ID
   *
   * @param {string} id - The product tag ID
   * @returns {Promise<ProductTag>} The product tag
   * @api {get} /wp-json/wc/v3/products/tags/:id Get product tag by ID
   *
   * @example
   * // Get a specific product tag
   * const tag = await productTagService.get('1');
   */
  async get(id: string): Promise<ProductTag> {
    const tag = await this.get<WooCommerceProductTag>(
      `/wp-json/wc/v3/products/tags/${id}`
    )
    return {
      ...tag,
      id: tag.id.toString()
    }
  }

  /**
   * Creates a new product tag
   *
   * @param {Object} data - The product tag data to create
   * @returns {Promise<ProductTag>} The created product tag
   * @api {post} /wp-json/wc/v3/products/tags Create product tag
   *
   * @example
   * // Create a new product tag
   * const newTag = await productTagService.create({
   *   name: 'Summer Sale',
   *   description: 'Products on sale this summer'
   * });
   */
  async create(data: {
    name: string
    description?: string
  }): Promise<ProductTag> {
    const tag = await this.post<WooCommerceProductTag>(
      '/wp-json/wc/v3/products/tags',
      data
    )
    return {
      ...tag,
      id: tag.id.toString()
    }
  }

  /**
   * Updates an existing product tag
   *
   * @param {string} id - The product tag ID to update
   * @param {Object} data - The product tag data to update
   * @returns {Promise<ProductTag>} The updated product tag
   * @api {put} /wp-json/wc/v3/products/tags/:id Update product tag
   *
   * @example
   * // Update a product tag
   * const updated = await productTagService.update('1', {
   *   name: 'Updated Sale'
   * });
   */
  async update(
    id: string,
    data: {
      name?: string
      description?: string
    }
  ): Promise<ProductTag> {
    const tag = await this.put<WooCommerceProductTag>(
      `/wp-json/wc/v3/products/tags/${id}`,
      data
    )
    return {
      ...tag,
      id: tag.id.toString()
    }
  }

  /**
   * Deletes a product tag
   *
   * @param {string} id - The product tag ID to delete
   * @param {boolean} [force=false] - Whether to force delete
   * @returns {Promise<{ deleted: boolean }>} The deletion result
   * @api {delete} /wp-json/wc/v3/products/tags/:id Delete product tag
   *
   * @example
   * // Delete a product tag
   * await productTagService.delete('1', true);
   */
  async delete(id: string, force: boolean = false): Promise<{ deleted: boolean }> {
    const result = await this.delete<{ deleted: boolean }>(
      `/wp-json/wc/v3/products/tags/${id}?force=${force}`
    )
    return result
  }

  /**
   * Batch create, update, and delete product tags
   *
   * @param {Object} data - The batch operations data
   * @returns {Promise<any>} The batch operation result
   * @api {post} /wp-json/wc/v3/products/tags/batch Batch operations
   *
   * @example
   * // Batch create product tags
   * await productTagService.batch({
   *   create: [{ name: 'New Tag', description: 'Description' }]
   * });
   */
  async batch(data: {
    create?: Array<{
      name: string
      description?: string
    }>
    update?: Array<{
      id: string
      name?: string
      description?: string
    }>
    delete?: string[]
  }): Promise<any> {
    return this.post('/wp-json/wc/v3/products/tags/batch', data)
  }
}

// Use singleton instance
export const productTagService = ProductTagService.getInstance()
