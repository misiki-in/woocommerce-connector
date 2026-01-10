import type { PaginatedResponse } from '../types'
import { BaseService } from './base-service'
import { PAGE_SIZE } from '../config'

/**
 * WooCommerce Product Attribute
 */
export interface WooCommerceProductAttribute {
  id: number
  name: string
  slug: string
  type: string
  order_by: string
  has_archives: boolean
}

/**
 * Product Attribute Term
 */
export interface ProductAttributeTerm {
  id: number
  name: string
  slug: string
  description: string
  menu_order: number
  count: number
}

/**
 * Extended attribute type for the application
 */
export interface ProductAttribute extends Omit<WooCommerceProductAttribute, 'id'> {
  id: string
  terms?: ProductAttributeTerm[]
}

/**
 * AttributeService provides functionality for working with WooCommerce product attributes
 *
 * WooCommerce REST API: /wp-json/wc/v3/products/attributes
 *
 * This service helps with:
 * - Fetching product attributes from WooCommerce
 * - Managing attribute terms
 * - Creating and updating attributes
 */
export class AttributeService extends BaseService {
  private static instance: AttributeService

  /**
   * Get the singleton instance
   *
   * @returns {AttributeService} The singleton instance of AttributeService
   */
  static getInstance(): AttributeService {
    if (!AttributeService.instance) {
      AttributeService.instance = new AttributeService()
    }
    return AttributeService.instance
  }

  /**
   * Fetches all product attributes from WooCommerce
   *
   * @returns {Promise<ProductAttribute[]>} List of product attributes
   * @api {get} /wp-json/wc/v3/products/attributes List all attributes
   *
   * @example
   * // Get all product attributes
   * const attributes = await attributeService.listAttributes();
   */
  async listAttributes(): Promise<ProductAttribute[]> {
    const attributes = await this.get<WooCommerceProductAttribute[]>(
      '/wp-json/wc/v3/products/attributes'
    )
    return attributes.map(attr => ({
      ...attr,
      id: attr.id.toString()
    }))
  }

  /**
   * Fetches a single product attribute by ID
   *
   * @param {string} id - The attribute ID
   * @returns {Promise<ProductAttribute>} The product attribute
   * @api {get} /wp-json/wc/v3/products/attributes/:id Get attribute by ID
   *
   * @example
   * // Get a specific attribute
   * const attribute = await attributeService.getAttribute('3');
   */
  async getAttribute(id: string): Promise<ProductAttribute> {
    const attribute = await this.get<WooCommerceProductAttribute>(
      `/wp-json/wc/v3/products/attributes/${id}`
    )
    return {
      ...attribute,
      id: attribute.id.toString()
    }
  }

  /**
   * Fetches terms for a specific attribute
   *
   * @param {string} attributeId - The attribute ID
   * @param {Object} options - Additional options
   * @param {number} [options.page=1] - Page number for pagination
   * @param {number} [options.perPage=100] - Number of terms per page
   * @returns {Promise<PaginatedResponse<ProductAttributeTerm>>} Paginated list of terms
   * @api {get} /wp-json/wc/v3/products/attributes/:attribute_id/terms List attribute terms
   *
   * @example
   * // Get terms for an attribute
   * const terms = await attributeService.getAttributeTerms('3');
   */
  async getAttributeTerms(
    attributeId: string,
    options: { page?: number; perPage?: number } = {}
  ): Promise<PaginatedResponse<ProductAttributeTerm>> {
    const { page = 1, perPage = 100 } = options
    const searchParams = new URLSearchParams()
    searchParams.set('page', page.toString())
    searchParams.set('per_page', perPage.toString())

    const terms = await this.get<ProductAttributeTerm[]>(
      `/wp-json/wc/v3/products/attributes/${attributeId}/terms?${searchParams.toString()}`
    )

    return {
      page,
      pageSize: perPage,
      count: terms.length,
      data: terms,
      noOfPage: Math.ceil(terms.length / perPage)
    }
  }

  /**
   * Creates a new product attribute
   *
   * @param {Object} data - The attribute data to create
   * @returns {Promise<ProductAttribute>} The created attribute
   * @api {post} /wp-json/wc/v3/products/attributes Create attribute
   *
   * @example
   * // Create a new attribute
   * const newAttribute = await attributeService.createAttribute({
   *   name: 'Color',
   *   slug: 'color',
   *   type: 'select',
   *   order_by: 'menu_order',
   *   has_archives: true
   * });
   */
  async createAttribute(data: {
    name: string
    slug?: string
    type?: string
    order_by?: string
    has_archives?: boolean
  }): Promise<ProductAttribute> {
    const attribute = await this.post<WooCommerceProductAttribute>(
      '/wp-json/wc/v3/products/attributes',
      data
    )
    return {
      ...attribute,
      id: attribute.id.toString()
    }
  }

  /**
   * Updates an existing product attribute
   *
   * @param {string} id - The attribute ID to update
   * @param {Object} data - The attribute data to update
   * @returns {Promise<ProductAttribute>} The updated attribute
   * @api {put} /wp-json/wc/v3/products/attributes/:id Update attribute
   *
   * @example
   * // Update an attribute
   * const updated = await attributeService.updateAttribute('3', {
   *   name: 'New Color Name'
   * });
   */
  async updateAttribute(
    id: string,
    data: {
      name?: string
      slug?: string
      type?: string
      order_by?: string
      has_archives?: boolean
    }
  ): Promise<ProductAttribute> {
    const attribute = await this.put<WooCommerceProductAttribute>(
      `/wp-json/wc/v3/products/attributes/${id}`,
      data
    )
    return {
      ...attribute,
      id: attribute.id.toString()
    }
  }

  /**
   * Deletes a product attribute
   *
   * @param {string} id - The attribute ID to delete
   * @param {boolean} [force=false] - Whether to force delete (bypass trash)
   * @returns {Promise<{ deleted: boolean }>} The deletion result
   * @api {delete} /wp-json/wc/v3/products/attributes/:id Delete attribute
   *
   * @example
   * // Delete an attribute
   * await attributeService.deleteAttribute('3', true);
   */
  async deleteAttribute(id: string, force: boolean = false): Promise<{ deleted: boolean }> {
    const result = await this.delete<{ deleted: boolean }>(
      `/wp-json/wc/v3/products/attributes/${id}?force=${force}`
    )
    return result
  }
}

// Use singleton instance
export const attributeService = AttributeService.getInstance()
