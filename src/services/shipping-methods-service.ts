import { BaseService } from './base-service';
import { GenericParams } from '../types/generic';

export interface ShippingZone {
  id: number;
  name: string;
  order: number;
}

export interface ShippingZoneLocation {
  id: number;
  code: string;
  type: 'country' | 'state' | 'continent' | 'postcode';
}

export interface ShippingZoneMethod {
  id: number;
  instance_id: number;
  method_id: string;
  method_title: string;
  method_description: string;
  enabled: boolean;
  settings: Record<string, unknown>;
}

export interface ShippingMethodClass {
  id: string;
  slug: string;
  name: string;
  description: string;
}

export class ShippingZonesService extends BaseService {
  /**
   * List all shipping zones
   */
  async list(params?: GenericParams): Promise<ApiResponse<ShippingZone[]>> {
    return this.get<ShippingZone[]>('/shipping/zones', params);
  }

  /**
   * Retrieve a shipping zone
   * @param id The shipping zone ID
   */
  async get(id: string): Promise<ApiResponse<ShippingZone>> {
    return this.get<ShippingZone>(`/shipping/zones/${id}`);
  }

  /**
   * Update a shipping zone
   * @param id The shipping zone ID
   * @param data The updated zone data
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
   */
  async delete(id: string): Promise<ApiResponse<ShippingZone>> {
    return this.delete<ShippingZone>(`/shipping/zones/${id}`);
  }
}

export class ShippingZoneLocationsService extends BaseService {
  /**
   * List all locations for a shipping zone
   * @param zoneId The shipping zone ID
   */
  async list(zoneId: string): Promise<ApiResponse<ShippingZoneLocation[]>> {
    return this.get<ShippingZoneLocation[]>(
      `/shipping/zones/${zoneId}/locations`
    );
  }

  /**
   * Update locations for a shipping zone
   * @param zoneId The shipping zone ID
   * @param locations The locations data
   */
  async update(
    zoneId: string,
    locations: ShippingZoneLocation[]
  ): Promise<ApiResponse<ShippingZoneLocation[]>> {
    return this.put<ShippingZoneLocation[]>(
      `/shipping/zones/${zoneId}/locations`,
      locations
    );
  }
}

export class ShippingZoneMethodsService extends BaseService {
  /**
   * List all shipping methods for a zone
   * @param zoneId The shipping zone ID
   */
  async list(zoneId: string): Promise<ApiResponse<ShippingZoneMethod[]>> {
    return this.get<ShippingZoneMethod[]>(
      `/shipping/zones/${zoneId}/methods`
    );
  }

  /**
   * Retrieve a shipping method
   * @param zoneId The shipping zone ID
   * @param instanceId The method instance ID
   */
  async get(zoneId: string, instanceId: string): Promise<ApiResponse<ShippingZoneMethod>> {
    return this.get<ShippingZoneMethod>(
      `/shipping/zones/${zoneId}/methods/${instanceId}`
    );
  }

  /**
   * Create a new shipping method
   * @param zoneId The shipping zone ID
   * @param data The method data
   */
  async create(
    zoneId: string,
    data: Partial<ShippingZoneMethod>
  ): Promise<ApiResponse<ShippingZoneMethod>> {
    return this.post<ShippingZoneMethod>(
      `/shipping/zones/${zoneId}/methods`,
      data
    );
  }

  /**
   * Update a shipping method
   * @param zoneId The shipping zone ID
   * @param instanceId The method instance ID
   * @param data The updated method data
   */
  async update(
    zoneId: string,
    instanceId: string,
    data: Partial<ShippingZoneMethod>
  ): Promise<ApiResponse<ShippingZoneMethod>> {
    return this.put<ShippingZoneMethod>(
      `/shipping/zones/${zoneId}/methods/${instanceId}`,
      data
    );
  }

  /**
   * Delete a shipping method
   * @param zoneId The shipping zone ID
   * @param instanceId The method instance ID
   */
  async delete(zoneId: string, instanceId: string): Promise<ApiResponse<ShippingZoneMethod>> {
    return this.delete<ShippingZoneMethod>(
      `/shipping/zones/${zoneId}/methods/${instanceId}`
    );
  }
}

export class ShippingMethodClassesService extends BaseService {
  /**
   * List all shipping method classes
   */
  async list(): Promise<ApiResponse<ShippingMethodClass[]>> {
    return this.get<ShippingMethodClass[]>('/shipping/classes');
  }

  /**
   * Retrieve a shipping method class
   * @param id The class ID
   */
  async get(id: string): Promise<ApiResponse<ShippingMethodClass>> {
    return this.get<ShippingMethodClass>(`/shipping/classes/${id}`);
  }

  /**
   * Create a new shipping method class
   * @param data The class data
   */
  async create(
    data: Partial<ShippingMethodClass>
  ): Promise<ApiResponse<ShippingMethodClass>> {
    return this.post<ShippingMethodClass>('/shipping/classes', data);
  }

  /**
   * Update a shipping method class
   * @param id The class ID
   * @param data The updated class data
   */
  async update(
    id: string,
    data: Partial<ShippingMethodClass>
  ): Promise<ApiResponse<ShippingMethodClass>> {
    return this.put<ShippingMethodClass>(`/shipping/classes/${id}`, data);
  }

  /**
   * Delete a shipping method class
   * @param id The class ID
   */
  async delete(id: string): Promise<ApiResponse<ShippingMethodClass>> {
    return this.delete<ShippingMethodClass>(`/shipping/classes/${id}`);
  }
}
