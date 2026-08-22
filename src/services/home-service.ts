import type { Category, Product } from '../types'
import { mapCategoryGeneric, mapProductGeneric } from '../mappers/generic.mapper'
import { BaseService } from './base.service'

const PRODUCT_FIELDS = { id: 'id', title: 'name', slug: 'slug', price: 'price', mrp: 'regular_price', description: 'description', image: 'images.0.src', stock: 'stock_quantity' } as const
const CATEGORY_FIELDS = { id: 'id', title: 'name', slug: 'slug' } as const

/**
 * Home section. litekart's `Home` (src/types/common-types.ts) is just `{ name: string }`;
 * the extra fields are additive so the composed payload is actually usable.
 */
export type Home = {
  name: string
  type: 'featured-products' | 'on-sale-products' | 'categories'
  products?: Product[]
  categories?: Category[]
}

/** HomeService — WooCommerce. Signatures mirror @misiki/litekart-connector. */
export class HomeService extends BaseService {
  private static instance: HomeService
  static getInstance(): HomeService { if (!HomeService.instance) HomeService.instance = new HomeService(); return HomeService.instance }

  /**
   * WooCommerce has no aggregate "home payload" endpoint, so the sections are composed from
   * three real v3 routes in one round of parallel requests:
   *   GET /products?featured=true&status=publish   https://woocommerce.github.io/woocommerce-rest-api-docs/#list-all-products
   *   GET /products?on_sale=true&status=publish
   *   GET /products/categories?hide_empty=true     https://woocommerce.github.io/woocommerce-rest-api-docs/#product-categories
   * per_page is always explicit: every v3 list route defaults to 10 (max 100).
   *
   * The WordPress front page itself is deliberately NOT fetched: identifying it needs
   * `page_on_front` from wp/v2/settings, which requires a real WordPress credential (the
   * ck/cs Basic header does not authenticate WP core and would 401).
   */
  async getHome(): Promise<Home[]> {
    const [featured, onSale, categories] = await Promise.all([
      this.get<any[]>('/products' + this.qs({ featured: true, status: 'publish', per_page: 20, orderby: 'date', order: 'desc' })),
      this.get<any[]>('/products' + this.qs({ on_sale: true, status: 'publish', per_page: 20, orderby: 'date', order: 'desc' })),
      this.get<any[]>('/products/categories' + this.qs({ per_page: 100, hide_empty: true, orderby: 'name', order: 'asc' }))
    ])
    const storeId = this.creds.storeId
    const toProducts = (raw: any) => (Array.isArray(raw) ? raw : []).map((x) => mapProductGeneric(x, PRODUCT_FIELDS, { storeId }))

    return [
      { name: 'Featured products', type: 'featured-products', products: toProducts(featured) },
      { name: 'On sale', type: 'on-sale-products', products: toProducts(onSale) },
      { name: 'Categories', type: 'categories', categories: (Array.isArray(categories) ? categories : []).map((x) => mapCategoryGeneric(x, CATEGORY_FIELDS)) }
    ]
  }
}

export const homeService = HomeService.getInstance()
