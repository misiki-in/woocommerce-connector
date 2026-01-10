import type { PaginatedResponse } from '../types'
import { BaseService } from './base-service'

/**
 * WooCommerce Shipping Zone Location
 */
export interface ShippingZoneLocation {
  code: string
  type: 'country' | 'state' | 'continent' | 'postcode'
}

/**
 * WooCommerce Shipping Zone Method
 */
export interface ShippingZoneMethod {
  id: number
  instance_id: number
  title: string
  method_id: string
  method_title: string
  method_description: string
  enabled: boolean
  settings: Record<string, any>
}

/**
 * WooCommerce Shipping Zone
 */
export interface ShippingZone {
  id: number
  name: string
  order_type: number
  locations: ShippingZoneLocation[]
  zone_methods: ShippingZoneMethod[]
}

/**
 * ShippingService provides functionality for working with WooCommerce shipping
 *
 * WooCommerce REST API: /wp-json/wc/v3/shipping/zones
 *
 * This service helps with:
 * - Fetching shipping zones from WooCommerce
 * - Managing shipping methods
 * - Getting shipping classes
 */
export class ShippingService extends BaseService {
  private static instance: ShippingService

  /**
   * Get the singleton instance
   *
   * @returns {ShippingService} The singleton instance of ShippingService
   */
  static getInstance(): ShippingService {
    if (!ShippingService.instance) {
      ShippingService.instance = new ShippingService()
    }
    return ShippingService.instance
  }

  /**
   * Fetches all shipping zones from WooCommerce
   *
   * @returns {Promise<ShippingZone[]>} List of shipping zones
   * @api {get} /wp-json/wc/v3/shipping/zones List all shipping zones
   *
   * @example
   * // Get all shipping zones
   * const zones = await shippingService.listZones();
   */
  async listZones(): Promise<ShippingZone[]> {
    const zones = await this.get<ShippingZone[]>(
      '/wp-json/wc/v3/shipping/zones'
    )
    return zones
  }

  /**
   * Fetches a single shipping zone by ID
   *
   * @param {string} id - The zone ID
   * @returns {Promise<ShippingZone>} The shipping zone
   * @api {get} /wp-json/wc/v3/shipping/zones/:id Get shipping zone by ID
   *
   * @example
   * // Get a specific shipping zone
   * const zone = await shippingService.getZone('1');
   */
  async getZone(id: string): Promise<ShippingZone> {
    const zone = await this.get<ShippingZone>(
      `/wp-json/wc/v3/shipping/zones/${id}`
    )
    return zone
  }

  /**
   * Fetches shipping methods for a specific zone
   *
   * @param {string} zoneId - The zone ID
   * @returns {Promise<ShippingZoneMethod[]>} List of shipping methods
   * @api {get} /wp-json/wc/v3/shipping/zones/:id/methods Get zone shipping methods
   *
   * @example
   * // Get shipping methods for a zone
   * const methods = await shippingService.getZoneMethods('1');
   */
  async getZoneMethods(zoneId: string): Promise<ShippingZoneMethod[]> {
    const methods = await this.get<ShippingZoneMethod[]>(
      `/wp-json/wc/v3/shipping/zones/${zoneId}/methods`
    )
    return methods
  }

  /**
   * Updates a shipping method in a zone
   *
   * @param {string} zoneId - The zone ID
   * @param {string} methodId - The method instance ID
   * @param {Object} data - The method data to update
   * @returns {Promise<ShippingZoneMethod>} The updated shipping method
   * @api {put} /wp-json/wc/v3/shipping/zones/:id/methods/:instance_id Update shipping method
   *
   * @example
   * // Update a shipping method
   * const updated = await shippingService.updateZoneMethod('1', '2', {
   *   title: 'New Shipping Title',
   *   enabled: true
   * });
   */
  async updateZoneMethod(
    zoneId: string,
    methodId: string,
    data: {
      title?: string
      enabled?: boolean
      settings?: Record<string, any>
    }
  ): Promise<ShippingZoneMethod> {
    const method = await this.put<ShippingZoneMethod>(
      `/wp-json/wc/v3/shipping/zones/${zoneId}/methods/${methodId}`,
      data
    )
    return method
  }

  /**
   * Fetches all shipping classes
   *
   * @returns {Promise<any[]>} List of shipping classes
   * @api {get} /wp-json/wc/v3/products/shipping_classes List shipping classes
   *
   * @example
   * // Get all shipping classes
   * const classes = await shippingService.listShippingClasses();
   */
  async listShippingClasses(): Promise<any[]> {
    const classes = await this.get<any[]>(
      '/wp-json/wc/v3/products/shipping_classes'
    )
    return classes
  }

  /**
   * Fetches a single shipping class by ID
   *
   * @param {string} id - The shipping class ID
   * @returns {Promise<any>} The shipping class
   * @api {get} /wp-json/wc/v3/products/shipping_classes/:id Get shipping class by ID
   *
   * @example
   * // Get a specific shipping class
   * const shippingClass = await shippingService.getShippingClass('5');
   */
  async getShippingClass(id: string): Promise<any> {
    const shippingClass = await this.get<any>(
      `/wp-json/wc/v3/products/shipping_classes/${id}`
    )
    return shippingClass
  }
}

// Use singleton instance
export const shippingService = ShippingService.getInstance()
