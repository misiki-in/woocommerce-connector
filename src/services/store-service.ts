import { storeData } from "../config"
import { BaseService } from "./base-service"
import { CategoryService } from "./category-service"

/**
 * StoreService provides functionality for retrieving store information
<<<<<<< HEAD
 * in the Litekart platform.
 *
 * This service helps with:
 * - Retrieving store details by ID or domain
 * - Accessing store configuration and settings
 * - Facilitating multi-store operations
=======
 * in the Shopify platform.
 *
 * This service helps with:
 * - Retrieving shop details
 * - Accessing shop configuration and settings
>>>>>>> f348a1b (feat: product listing)
 */
export class StoreService extends BaseService {
  private static instance: StoreService
  private categoryService: CategoryService

  /**
   * Get the singleton instance
   *
   * @returns {StoreService} The singleton instance of StoreService
   */
  static getInstance(): StoreService {
    if (!StoreService.instance) {
      StoreService.instance = new StoreService()
    }
    return StoreService.instance
  }

<<<<<<< HEAD
  constructor(fetchFn?: typeof fetch) {
    super(fetchFn)
    this.categoryService = new CategoryService(fetchFn)
  }

  /**
   * Retrieves store details by ID or domain name
=======
  constructor() {
    super()
    this.categoryService = CategoryService.getInstance()
  }

  /**
   * Retrieves shop details
   *
   * @returns {Promise<any>} The shop details
   */
  async getShop() {
    try {
      const shop = await this.get<any>('/shop.json')
      return shop
    } catch (error: any) {
      console.error("Error fetching shop:", error)
      return {}
    }
  }

  /**
   * Retrieves store details (legacy method, uses config)
>>>>>>> f348a1b (feat: product listing)
   *
   * @param {Object} params - The parameters for fetching the store
   * @param {string} [params.storeId] - The ID of the store to fetch
   * @param {string} [params.domain] - The domain name of the store to fetch
   * @returns {Promise<any>} The store details
<<<<<<< HEAD
   * @api {get} /api/stores/public-details Get store details
   *
   * @example
   * // Get store by ID
   * const store = await storeService.getStoreByIdOrDomain({
   *   storeId: '123'
   * });
   *
   * // Get store by domain
   * const store = await storeService.getStoreByIdOrDomain({
   *   domain: 'mystore.example.com'
   * });
=======
>>>>>>> f348a1b (feat: product listing)
   */
  async getStoreByIdOrDomain({
    storeId,
    domain
  }: {
    storeId?: string
    domain?: string
  }) {
    const store = JSON.parse(storeData)
    store.megamenu = await this.categoryService.getMegamenu()
    return store
  }
}

// Use singleton instance
export const storeService = StoreService.getInstance()
