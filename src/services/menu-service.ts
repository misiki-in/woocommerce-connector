import type { Menu } from './../types'
import { BaseService } from './base-service'

/**
 * MenuService provides functionality for working with specific resources
 * in the Litekart API.
 *
 * This service helps with:
 * - Main functionality point 1
 * - Main functionality point 2
 * - Main functionality point 3
 */
export class MenuService extends BaseService {
  private static instance: MenuService

  /**
   * Get the singleton instance
   */
  /**
 * Get the singleton instance
 * 
 * @returns {MenuService} The singleton instance of MenuService
 */
  static getInstance(): MenuService {
    if (!MenuService.instance) {
      MenuService.instance = new MenuService()
    }
    return MenuService.instance
  }
  /**
 * Fetches Menu from the API
 * 
 * @param {Object} options - The request options
 * @param {number} [options.page=1] - The page number for pagination
 * @param {string} [options.q=''] - Search query string
 * @param {string} [options.sort='-createdAt'] - Sort order
 * @returns {Promise<any>} The requested data
 * @api {get} /api/menu Get menu
 * 
 * @example
 * // Example usage
 * const result = await menuService.list({ page: 1 });
 */
  async list() {
    //return this.get<Menu[]>('/api/menu')
    return JSON.parse(`{
    "count": 2,
    "data": [
        {
            "id": "menu_01JFYXAAMMXP69DMBG6FHD77JW",
            "active": true,
            "name": "Header",
            "menuId": "header",
            "link": null,
            "items": [],
            "storeId": "store_01JFY3G9F5NVT0R930JNKGQXRT",
            "userId": "user_01JB8S7AT0TAEPCBZZJ6YBRTBJ",
            "createdAt": "2024-12-25 12:40:26.006417",
            "updatedAt": "2024-12-25 12:40:26.006417"
        },
        {
            "id": "menu_01JFYXM0XK5KDEXH4KJC92YHWE",
            "active": true,
            "name": "Footer",
            "menuId": "footer",
            "link": null,
            "items": [
                {
                    "id": "5Eso6jtv2sIhPkUf5PJCM",
                    "link": "",
                    "name": "Company",
                    "items": [
                        {
                            "id": "iptHWOoeXjd3OMSICuuc9",
                            "link": "/privacy-policy",
                            "name": "Privacy policy"
                        },
                        {
                            "id": "3Yss7Ke-4jJ1mSOFE_baB",
                            "link": "/terms-and-conditions",
                            "name": "Terms & Conditions"
                        },
                        {
                            "id": "pq9y-bhoUNa3EzdOg-8Vb",
                            "link": "/shipping-policy",
                            "name": "Shipping Policy"
                        },
                        {
                            "id": "wVFn0frCpYOZaArXvwj0U",
                            "link": "/refund-policy",
                            "name": "Refund Policy"
                        },
                        {
                            "id": "1J9TBTDDf-oB6uo3trfhF",
                            "link": "/contact-us",
                            "name": "Contact Us"
                        }
                    ]
                }
            ],
            "storeId": "store_01JFY3G9F5NVT0R930JNKGQXRT",
            "userId": "user_01JB8S7AT0TAEPCBZZJ6YBRTBJ",
            "createdAt": "2024-12-25 12:45:44.016782",
            "updatedAt": "2024-12-25 12:45:44.016782"
        }
    ],
    "page": 1,
    "pageSize": 20,
    "noOfPage": 1,
    "cache": "HIT"
}`)
  }
}

// Use singleton instance
export const menuService = MenuService.getInstance()

