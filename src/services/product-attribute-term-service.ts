import { BaseService } from "./base-service";

export interface ProductAttributeTerm {
  id: number;
  name: string;
  slug: string;
  description: string;
  menu_order: number;
  count: number;
}

export interface ProductAttributeTermCreate {
  name: string;
  slug?: string;
  description?: string;
  menu_order?: number;
}

export class ProductAttributeTermService extends BaseService {
  private static instance: ProductAttributeTermService;

  static getInstance(): ProductAttributeTermService {
    if (!ProductAttributeTermService.instance) {
      ProductAttributeTermService.instance = new ProductAttributeTermService();
    }
    return ProductAttributeTermService.instance;
  }

  /**
   * List all terms for a product attribute
   */
  async list(attributeId: string, params?: {
    per_page?: number;
    page?: number;
    orderby?: 'id' | 'name' | 'slug' | 'description' | 'menu_order' | 'count';
    order?: 'asc' | 'desc';
  }) {
    const queryParams = new URLSearchParams();
    if (params?.per_page) queryParams.set('per_page', params.per_page.toString());
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.orderby) queryParams.set('orderby', params.orderby);
    if (params?.order) queryParams.set('order', params.order);
    
    const query = queryParams.toString();
    return this.get<ProductAttributeTerm[]>(`/wp-json/wc/v3/products/attributes/${attributeId}/terms${query ? `?${query}` : ''}`);
  }

  /**
   * Retrieve a single product attribute term
   */
  async get(attributeId: string, termId: string) {
    return this.get<ProductAttributeTerm>(`/wp-json/wc/v3/products/attributes/${attributeId}/terms/${termId}`);
  }

  /**
   * Create a new product attribute term
   */
  async create(attributeId: string, data: ProductAttributeTermCreate) {
    return this.post<ProductAttributeTerm>(`/wp-json/wc/v3/products/attributes/${attributeId}/terms`, data);
  }

  /**
   * Update a product attribute term
   */
  async update(attributeId: string, termId: string, data: Partial<ProductAttributeTermCreate>) {
    return this.put<ProductAttributeTerm>(`/wp-json/wc/v3/products/attributes/${attributeId}/terms/${termId}`, data);
  }

  /**
   * Delete a product attribute term
   */
  async delete(attributeId: string, termId: string, force?: boolean) {
    const queryParams = force ? `?force=true` : '';
    return this.delete<ProductAttributeTerm>(`/wp-json/wc/v3/products/attributes/${attributeId}/terms/${termId}${queryParams}`);
  }
}

export const productAttributeTermService = ProductAttributeTermService.getInstance();
