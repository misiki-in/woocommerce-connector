import { BaseService } from "./base-service";

export interface ProductAttribute {
  id: number;
  name: string;
  slug: string;
  type: 'select' | 'text';
  order_by: 'menu_order' | 'name' | 'name_num' | 'id';
  has_archives: boolean;
}

export interface ProductAttributeCreate {
  name: string;
  slug?: string;
  type?: 'select' | 'text';
  order_by?: 'menu_order' | 'name' | 'name_num' | 'id';
  has_archives?: boolean;
}

export class ProductAttributeService extends BaseService {
  private static instance: ProductAttributeService;

  static getInstance(): ProductAttributeService {
    if (!ProductAttributeService.instance) {
      ProductAttributeService.instance = new ProductAttributeService();
    }
    return ProductAttributeService.instance;
  }

  /**
   * List all product attributes
   */
  async list(params?: {
    per_page?: number;
    page?: number;
    orderby?: 'id' | 'name' | 'slug' | 'type' | 'order_by' | 'has_archives';
    order?: 'asc' | 'desc';
  }) {
    const queryParams = new URLSearchParams();
    if (params?.per_page) queryParams.set('per_page', params.per_page.toString());
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.orderby) queryParams.set('orderby', params.orderby);
    if (params?.order) queryParams.set('order', params.order);
    
    const query = queryParams.toString();
    return this.get<ProductAttribute[]>(`/wp-json/wc/v3/products/attributes${query ? `?${query}` : ''}`);
  }

  /**
   * Retrieve a single product attribute
   */
  async get(attributeId: string) {
    return this.get<ProductAttribute>(`/wp-json/wc/v3/products/attributes/${attributeId}`);
  }

  /**
   * Create a new product attribute
   */
  async create(data: ProductAttributeCreate) {
    return this.post<ProductAttribute>('/wp-json/wc/v3/products/attributes', data);
  }

  /**
   * Update a product attribute
   */
  async update(attributeId: string, data: Partial<ProductAttributeCreate>) {
    return this.put<ProductAttribute>(`/wp-json/wc/v3/products/attributes/${attributeId}`, data);
  }

  /**
   * Delete a product attribute
   */
  async delete(attributeId: string, force?: boolean) {
    const queryParams = force ? `?force=true` : '';
    return this.delete<ProductAttribute>(`/wp-json/wc/v3/products/attributes/${attributeId}${queryParams}`);
  }
}

export const productAttributeService = ProductAttributeService.getInstance();
