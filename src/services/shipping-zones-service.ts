import { BaseService } from './base-service';
import { ShippingZone } from '../types/store-types';
import { ApiResponse } from '../types/api-response';

export class ShippingZonesService extends BaseService {
  /**
   * List all shipping zones
   */
  async list(): Promise<ApiResponse<ShippingZone[]>> {
    return this.get<ShippingZone[]>('/shipping/zones');
  }

  /**
   * Retrieve a single shipping zone
   * @param id The shipping zone ID
   */
  async get(id: string): Promise<ApiResponse<ShippingZone>> {
    return this.get<ShippingZone>(`/shipping/zones/${id}`);
  }

  /**
   * Create a new shipping zone
   * @param data The shipping zone data
   */
  async create(data: Partial<ShippingZone>): Promise<ApiResponse<ShippingZone>> {
    return this.post<ShippingZone>('/shipping/zones', data);
  }

  /**
   * Update a shipping zone
   * @param id The shipping zone ID
   * @param data The updated shipping zone data
   */
  async update(
    id: string,
    data: Partial<ShippingZone>
  ): Promise<ApiResponse<ShippingZone>> {
    return this.put<ShippingZone>(`/shipping/zones/${id}`, data);
  }

  /**
   * Delete a shipping zone
   * @param id The shipping zone ID
   * @param force Whether to force delete
   */
  async delete(id: string, force?: boolean): Promise<ApiResponse<ShippingZone>> {
    const endpoint = `/shipping/zones/${id}`;
    if (force) {
      return this.delete<ShippingZone>(`${endpoint}?force=true`);
    }
    return this.delete<ShippingZone>(endpoint);
  }
}
