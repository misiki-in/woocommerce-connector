import type { PaginatedResponse } from '../types'
import { BaseService } from './base-service'
import { PAGE_SIZE } from '../config'

/**
 * WooCommerce Product Tag
 */
export interface WooCommerceProductTag {
  id: number
  name: string
  slug: string
  description: string
  count: number
}

/**
 * Extended tag type for the application
 */
export interface ProductTag extends Omit<WooCommerceProductTag, 'id'> {
  id: string
}

/**
 * TagService provides functionality for working with WooCommerce product tags
 *
 * WooCommerce REST API: /wp-json/wc/v3/products/tags
 *
 * This service helps with:
 * - Fetching product tags from WooCommerce
 * - Creating and managing tags
 * - Searching tags
 */
export class TagService extends BaseService {
  private static instance: TagService

  /**
   * Get the singleton instance
   *
   * @returns {TagService} The singleton instance of TagService
   */
  static getInstance(): TagService {
    if (!TagService.instance) {
      TagService.instance = new TagService()
    }
    return TagService.instance
  }

  /**
   * Fetches all product tags from WooCommerce with optional filtering
   *
   * @param {Object} options - The request options
   * @param {number} [options.page=1] - The page number for pagination
   * @param {string} [options.q=''] - Search query string
   * @param {number} [options.perPage=100] - Number of tags per page
   * @param {string} [options.hideEmpty='false'] - Hide tags with zero product count
   * @returns {Promise<PaginatedResponse<ProductTag>>} Paginated list of tags
   * @api {get} /wp-json/wc/v3/products/tags List all tags
   *
   * @example
   * // Get all product tags
   * const tags = await tagService.list({ page: 1 });
   */
  async list(options: {
    page?: number
    q?: string
    perPage?: number
    hideEmpty?: string
  } = {}): Promise<PaginatedResponse<ProductTag>> {
    const { page = 1, q = '', perPage = 100, hideEmpty = 'false' } = options
    const searchParams = new URLSearchParams()
    searchParams.set('page', page.toString())
    searchParams.set('per_page', perPage.toString())
    searchParams.set('hide_empty', hideEmpty)
    if (q) {
      searchParams.set('search', q)
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
   * @param {string} id - The tag ID
   * @returns {Promise<ProductTag>} The product tag
   * @api {get} /wp-json/wc/v3/products/tags/:id Get tag by ID
   *
   * @example
   * // Get a specific tag
   * const tag = await tagService.getTag('15');
   */
  async getTag(id: string): Promise<ProductTag> {
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
   * @param {Object} data - The tag data to create
   * @returns {Promise<ProductTag>} The created tag
   * @api {post} /wp-json/wc/v3/products/tags Create tag
   *
   * @example
   * // Create a new tag
   * const newTag = await tagService.createTag({
   *   name: 'Summer Sale',
   *   description: 'Products on summer sale'
   * });
   */
  async createTag(data: {
    name: string
    slug?: string
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
   * @param {string} id - The tag ID to update
   * @param {Object} data - The tag data to update
   * @returns {Promise<ProductTag>} The updated tag
   * @api {put} /wp-json/wc/v3/products/tags/:id Update tag
   *
   * @example
   * // Update a tag
   * const updated = await tagService.updateTag('15', {
   *   name: 'Updated Tag Name'
   * });
   */
  async updateTag(
    id: string,
    data: {
      name?: string
      slug?: string
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
   * @param {string} id - The tag ID to delete
   * @param {boolean} [force=false] - Whether to force delete (bypass trash)
   * @returns {Promise<{ deleted: boolean }>} The deletion result
   * @api {delete} /wp-json/wc/v3/products/tags/:id Delete tag
   *
   * @example
   * // Delete a tag
   * await tagService.deleteTag('15', true);
   */
  async deleteTag(id: string, force: boolean = false): Promise<{ deleted: boolean }> {
    const result = await this.delete<{ deleted: boolean }>(
      `/wp-json/wc/v3/products/tags/${id}?force=${force}`
    )
    return result
  }

  /**
   * Batch create, update, and delete tags
   *
   * @param {Object} data - The batch operations data
   * @returns {Promise<any>} The batch operation result
   * @api {post} /wp-json/wc/v3/products/tags/batch Batch operations
   *
   * @example
   * // Batch create tags
   * await tagService.batch({
   *   create: [{ name: 'New Tag 1' }, { name: 'New Tag 2' }]
   * });
   */
  async batch(data: {
    create?: Array<{ name: string; slug?: string; description?: string }>
    update?: Array<{ id: string; name?: string; slug?: string; description?: string }>
    delete?: string[]
  }): Promise<any> {
    return this.post('/wp-json/wc/v3/products/tags/batch', data)
  }
}

// Use singleton instance
export const tagService = TagService.getInstance()
