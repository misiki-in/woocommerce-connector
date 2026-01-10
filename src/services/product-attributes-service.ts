import { BaseService } from './base-service';
import { ProductAttribute, ProductAttributeTerm } from '../types/product-types';
import { ApiResponse } from '../types/api-response';
import { GenericParams } from '../types/generic';

export class ProductAttributesService extends BaseService {
  /**
   * List all product attributes
   */
  async list(params?: GenericParams): Promise<ApiResponse<ProductAttribute[]>> {
    return this.get<ProductAttribute[]>('/products/attributes', params);
  }

  /**
   * Retrieve a single product attribute
   * @param id The product attribute ID
   */
  async get(id: string): Promise<ApiResponse<ProductAttribute>> {
    return this.get<ProductAttribute>(`/products/attributes/${id}`);
  }

  /**
   * Create a new product attribute
   * @param data The product attribute data
   */
  async create(
    data: Partial<ProductAttribute>
  ): Promise<ApiResponse<ProductAttribute>> {
    return this.post<ProductAttribute>('/products/attributes', data);
  }

  /**
   * Update a product attribute
   * @param id The product attribute ID
   * @param data The updated product attribute data
   */
  async update(
    id: string,
    data: Partial<ProductAttribute>
  ): Promise<ApiResponse<ProductAttribute>> {
    return this.put<ProductAttribute>(`/products/attributes/${id}`, data);
  }

  /**
   * Delete a product attribute
   * @param id The product attribute ID
   * @param force Whether to force delete (trash is not supported for attributes)
   */
  async delete(id: string, force?: boolean): Promise<ApiResponse<ProductAttribute>> {
    const endpoint = `/products/attributes/${id}`;
    if (force) {
      return this.delete<ProductAttribute>(`${endpoint}?force=true`);
    }
    return this.delete<ProductAttribute>(endpoint);
  }
}

export class ProductAttributeTermsService extends BaseService {
  /**
   * List all terms for a product attribute
   * @param attributeId The product attribute ID
   * @param params Query parameters
   */
  async list(
    attributeId: string,
    params?: GenericParams
  ): Promise<ApiResponse<ProductAttributeTerm[]>> {
    return this.get<ProductAttributeTerm[]>(
      `/products/attributes/${attributeId}/terms`,
      params
    );
  }

  /**
   * Retrieve a single product attribute term
   * @param attributeId The product attribute ID
   * @param termId The term ID
   */
  async get(
    attributeId: string,
    termId: string
  ): Promise<ApiResponse<ProductAttributeTerm>> {
    return this.get<ProductAttributeTerm>(
      `/products/attributes/${attributeId}/terms/${termId}`
    );
  }

  /**
   * Create a new product attribute term
   * @param attributeId The product attribute ID
   * @param data The term data
   */
  async create(
    attributeId: string,
    data: Partial<ProductAttributeTerm>
  ): Promise<ApiResponse<ProductAttributeTerm>> {
    return this.post<ProductAttributeTerm>(
      `/products/attributes/${attributeId}/terms`,
      data
    );
  }

  /**
   * Update a product attribute term
   * @param attributeId The product attribute ID
   * @param termId The term ID
   * @param data The updated term data
   */
  async update(
    attributeId: string,
    termId: string,
    data: Partial<ProductAttributeTerm>
  ): Promise<ApiResponse<ProductAttributeTerm>> {
    return this.put<ProductAttributeTerm>(
      `/products/attributes/${attributeId}/terms/${termId}`,
      data
    );
  }

  /**
   * Delete a product attribute term
   * @param attributeId The product attribute ID
   * @param termId The term ID
   * @param force Whether to force delete
   */
  async delete(
    attributeId: string,
    termId: string,
    force?: boolean
  ): Promise<ApiResponse<ProductAttributeTerm>> {
    const endpoint = `/products/attributes/${attributeId}/terms/${termId}`;
    if (force) {
      return this.delete<ProductAttributeTerm>(`${endpoint}?force=true`);
    }
    return this.delete<ProductAttributeTerm>(endpoint);
  }
}
