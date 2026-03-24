<<<<<<< HEAD
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
=======
import base32 from 'hi-base32';

export let WOOCOMMERCE_STORE_URL: string = ''
export let WOOCOMMERCE_CONSUMER_KEY: string = ''
export let WOOCOMMERCE_CONSUMER_SECRET: string = ''

/**
 * BaseService provides core HTTP functionality for all WooCommerce service classes.
 */
export class BaseService {
  private _fetch: typeof fetch

  constructor(fetchFn?: typeof fetch) {
    this._fetch = fetchFn || (typeof fetch !== 'undefined' ? fetch : () => Promise.reject(new Error('fetch not available')))
  }

>>>>>>> f348a1b (feat: product listing)
  setFetch(fetchFn: typeof fetch) {
    this._fetch = fetchFn
    return this
  }

<<<<<<< HEAD
  /**
   * Get the current fetch instance
   *
   * @returns {typeof fetch} The current fetch implementation
   */
=======
>>>>>>> f348a1b (feat: product listing)
  getFetch(): typeof fetch {
    return this._fetch
  }

<<<<<<< HEAD
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
=======
  private async handleError(response: Response) {
    let message = `HTTP error ${response.status}: ${response.statusText}`
    try {
      const data = await response.json()
      message = data.message || message
    } catch (e) {
      // ignore
    }
    throw new Error(`WooCommerce API Error: ${message}`)
  }

  async callFetch<T>(url: string, body: any = {}): Promise<T> {
    const headers = {
      'Content-Type': 'application/json',
      ...body.headers
    }

    // Add Store API specific headers if needed
    if (url.includes('/wp-json/wc/store/')) {
      if (typeof window !== 'undefined') {
        const nonce = localStorage.getItem('wc_store_nonce')
        const cartToken = localStorage.getItem('wc_cart_token')
        if (nonce) headers['Nonce'] = nonce
        if (cartToken) headers['Cart-Token'] = cartToken
      }
    }

    // Add credentials to URL as query params (proxy handles this based on encoded URL)
    const fullUrl = typeof window != 'undefined'
      ? `${window.location.origin}/proxy/woocommerce/${base32.encode(url)}`
      : `/proxy/woocommerce/${base32.encode(url)}`

    try {
      const response = await this._fetch(fullUrl, {
        ...body,
        headers
      })

      // Extract and save new headers for Store API
      if (url.includes('/wp-json/wc/store/')) {
        const newNonce = response.headers.get('Nonce') || response.headers.get('X-WC-Store-API-Nonce')
        const newCartToken = response.headers.get('Cart-Token')
        
        if (typeof window !== 'undefined') {
          if (newNonce) localStorage.setItem('wc_store_nonce', newNonce)
          if (newCartToken) localStorage.setItem('wc_cart_token', newCartToken)
        }
      }

      if (!response.ok) {
        await this.handleError(response)
      }

      const text = await response.text()
      return text ? JSON.parse(text) as T : {} as T
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out')
      }
      throw error
    }
  }

  async get<T>(url: string, params: any = {}): Promise<T> {
    let fullUrl = url
    if (Object.keys(params).length > 0) {
      const queryParams = new URLSearchParams(params).toString()
      const separator = url.includes('?') ? '&' : '?'
      fullUrl = `${url}${separator}${queryParams}`
    }
    return this.callFetch<T>(fullUrl, { method: "GET" })
  }

  async post<T>(url: string, data: any): Promise<T> {
    return this.callFetch<T>(url, {
      method: "POST",
>>>>>>> f348a1b (feat: product listing)
      body: JSON.stringify(data)
    })
  }

<<<<<<< HEAD
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
=======
  async put<T>(url: string, data: any): Promise<T> {
    return this.callFetch<T>(url, {
      method: "PUT",
>>>>>>> f348a1b (feat: product listing)
      body: JSON.stringify(data)
    })
  }

<<<<<<< HEAD
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
=======
  async delete<T>(url: string): Promise<T> {
    return this.callFetch<T>(url, { method: "DELETE" })
>>>>>>> f348a1b (feat: product listing)
  }
}
