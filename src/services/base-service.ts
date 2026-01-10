export const PUBLIC_WOOCOMMERCE_API_PREFIX = "/wp-json/wc/v3"
export const PUBLIC_WOOCOMMERCE_STORE_API_PREFIX = "/wp-json/wc/store/v1"

export interface WooCommercePaginationHeaders {
  total: number
  totalPages: number
  currentPage: number
  perPage: number
}

/**
 * BaseService provides core HTTP functionality for all service classes
 * in the WooCommerce API client.
 *
 * This service helps with:
 * - Performing standardized HTTP requests (GET, POST, PUT, PATCH, DELETE)
 * - Handling response parsing and type conversion
 * - Providing a configurable fetch implementation
 * - Managing WooCommerce API authentication
 * - Pagination support for list endpoints
 */
export class BaseService {
  private static PUBLIC_WOOCOMMERCE_CONSUMER_KEY: string
  private static PUBLIC_WOOCOMMERCE_CONSUMER_SECRET: string
  private static WOOCOMMERCE_SITE_URL: string
  private _fetch: typeof fetch
  private _lastResponse: Response | null = null

  /**
   * Creates a new BaseService instance
   *
   * @param {typeof fetch} [fetchFn] - Optional custom fetch implementation
   */
  constructor(fetchFn?: typeof fetch) {
    // Use provided fetch or global fetch as fallback
    this._fetch = fetchFn || fetch
  }

  static setWooCommerceCredentials(siteUrl: string, consumerKey: string, consumerSecret: string) {
    this.WOOCOMMERCE_SITE_URL = siteUrl
    this.PUBLIC_WOOCOMMERCE_CONSUMER_KEY = consumerKey
    this.PUBLIC_WOOCOMMERCE_CONSUMER_SECRET = consumerSecret
  }

  /**
   * Get the site URL
   */
  static getSiteUrl(): string {
    return this.WOOCOMMERCE_SITE_URL
  }

  /**
   * Get the consumer key
   */
  static getConsumerKey(): string {
    return this.PUBLIC_WOOCOMMERCE_CONSUMER_KEY
  }

  /**
   * Get the consumer secret
   */
  static getConsumerSecret(): string {
    return this.PUBLIC_WOOCOMMERCE_CONSUMER_SECRET
  }

  /**
   * Set the fetch instance to be used by this service
   *
   * @param {typeof fetch} fetchFn - The fetch implementation to use
   * @returns {BaseService} The service instance for chaining
   */
  setFetch(fetchFn: typeof fetch) {
    this._fetch = fetchFn
    return this
  }

  /**
   * Get the current fetch instance
   *
   * @returns {typeof fetch} The current fetch implementation
   */
  getFetch(): typeof fetch {
    return this._fetch
  }

  /**
   * Get the last response (useful for accessing headers)
   */
  getLastResponse(): Response | null {
    return this._lastResponse
  }

  /**
   * Extract pagination headers from WooCommerce response
   */
  protected getPaginationHeaders(): WooCommercePaginationHeaders {
    const response = this._lastResponse
    if (!response) {
      return { total: 0, totalPages: 0, currentPage: 1, perPage: 20 }
    }

    return {
      total: parseInt(response.headers.get("X-WP-Total") || "0", 10),
      totalPages: parseInt(response.headers.get("X-WP-TotalPages") || "0", 10),
      currentPage: parseInt(new URLSearchParams(response.url?.split("?")[1] || "").get("page") || "1", 10),
      perPage: parseInt(new URLSearchParams(response.url?.split("?")[1] || "").get("per_page") || "20", 10)
    }
  }

  private async safeFetch(url: string, data?: any): Promise<Response> {
    try {
      // Handle both full URLs and relative paths
      let fullUrl: string
      if (url.startsWith('http')) {
        fullUrl = url
      } else if (url.startsWith('/')) {
        fullUrl = `${BaseService.WOOCOMMERCE_SITE_URL}${url}`
      } else {
        fullUrl = `${BaseService.WOOCOMMERCE_SITE_URL}${PUBLIC_WOOCOMMERCE_API_PREFIX}${url}`
      }

      const response = await this._fetch(fullUrl, data)
      this._lastResponse = response
      return response
    } catch (e: any) {
      // Check if navigator is available (browser environment)
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        throw { message: 'Please check your internet connection and try again', offline: true }
      }
      throw { message: 'Unable to reach the server. Please try again in a moment', networkError: true }
    }
  }

  private async handleError(response: Response) {
    const contentType = response.headers.get("Content-Type")
    
    // Try to parse JSON error response
    if (contentType?.includes("application/json")) {
      try {
        const data = await response.json()
        throw {
          message: data.message || data.error?.message || `HTTP error ${response.status}: ${response.statusText}`,
          code: data.code || response.status,
          data: data.data || null
        }
      } catch {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`)
      }
    }
    
    throw new Error(`HTTP error ${response.status}: ${response.statusText}`)
  }

  async callFetch<T>(url: string, body: any): Promise<T> {
    // Add authentication header
    const authHeader = 'Basic ' + btoa(`${BaseService.PUBLIC_WOOCOMMERCE_CONSUMER_KEY}:${BaseService.PUBLIC_WOOCOMMERCE_CONSUMER_SECRET}`)
    
    const response = await this.safeFetch(url, {
      ...body,
      headers: {
        ...body.headers,
        'Authorization': authHeader
      }
    })

    if (!response.ok) {
      await this.handleError(response)
    }

    // Handle 204 No Content response
    if (response.status === 204) {
      return {} as T
    }

    return (await response.json()) as T
  }

  /**
   * Perform a GET request
   *
   * @param {string} url - The URL to request
   * @returns {Promise<T>} Promise resolving to the response data
   * @template T - The expected response data type
   * @throws {Error} Throws an error if the request fails
   */
  async get<T>(url: string): Promise<T> {
    return this.callFetch<T>(url, {
      method: "GET"
    })
  }

  /**
   * Perform a POST request
   *
   * @param {string} url - The URL to request
   * @param {any} data - The data to send in the request body
   * @returns {Promise<T>} Promise resolving to the response data
   * @template T - The expected response data type
   * @throws {Error} Throws an error if the request fails
   */
  async post<T>(url: string, data: any): Promise<T> {
    return this.callFetch<T>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })
  }

  /**
   * Perform a PUT request
   *
   * @param {string} url - The URL to request
   * @param {any} data - The data to send in the request body
   * @returns {Promise<T>} Promise resolving to the response data
   * @template T - The expected response data type
   * @throws {Error} Throws an error if the request fails
   */
  async put<T>(url: string, data: any): Promise<T> {
    return this.callFetch<T>(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })
  }

  /**
   * Perform a PATCH request
   *
   * @param {string} url - The URL to request
   * @param {any} data - The data to send in the request body
   * @returns {Promise<T>} Promise resolving to the response data
   * @template T - The expected response data type
   * @throws {Error} Throws an error if the request fails
   */
  async patch<T>(url: string, data: any): Promise<T> {
    return this.callFetch<T>(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })
  }

  /**
   * Perform a DELETE request
   *
   * @param {string} url - The URL to request
   * @returns {Promise<T>} Promise resolving to the response data or status
   * @template T - The expected response data type
   * @throws {Error} Throws an error if the request fails
   */
  async delete<T>(url: string): Promise<T> {
    return this.callFetch<T>(url, {
      method: 'DELETE',
    })
  }
}
