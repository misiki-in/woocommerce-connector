<<<<<<< HEAD
import { PAGE_SIZE } from '../config'
import type { Collection, PaginatedResponse, Product } from '../types'
import { BaseService } from './base-service'
import { transformProduct } from './product-service'

interface CollectionExtended extends Collection {
  active: boolean
  collectionvalues?: {
    id: string
    products: Product
  }[]
}

export function transformCollection(col: any): CollectionExtended {
  return {
    ...col,
    id: col?.id,
    name: col?.title,
    slug: col?.handle,
    createdAt: col?.created_at,
    updatedAt: col?.updated_at,
    active: true,
    metaDescription: "",
    metaTitle: "",
  }
}

=======
import { BaseService } from './base-service.js'
import { transformWooCommerceCategory, CategoryService } from './category-service.js'
import type { Category } from '../types/index.js'

/**
 * CollectionService provides functionality for managing product collections.
 * In WooCommerce, this maps to product categories.
 */
>>>>>>> f348a1b (feat: product listing)
export class CollectionService extends BaseService {
  private static instance: CollectionService

  static getInstance(): CollectionService {
    if (!CollectionService.instance) {
      CollectionService.instance = new CollectionService()
    }
    return CollectionService.instance
  }

<<<<<<< HEAD
  async addAssociatedProducts(col: CollectionExtended) {
    col = transformCollection(col)
    col.collectionvalues = await this.getProducts(col?.id)
    return col
  }

  async list({ page = 1, limit = 10, q = '', sort = '-created_at' }) {
    const searchParams = new URLSearchParams()
    searchParams.set('offset', ((page - 1) * PAGE_SIZE).toString())
    searchParams.set('limit', String(PAGE_SIZE))
    searchParams.set('fields', '+products')

    const res = await this.get<any>(`/store/collections?` + searchParams.toString())
    const collections = []
    for (const col of res.collections)
      collections.push(this.addAssociatedProducts(col))

    return {
      page,
      pageSize: PAGE_SIZE,
      count: res.count,
      data: await Promise.all(collections),
      noOfPage: Math.ceil(res.count / PAGE_SIZE)
    }
  }

  async getOne(id: string) {
    const res = await this.get<{ collection: any }>(`/store/collections/${id}`)
    return await this.addAssociatedProducts(res.collection)
  }

  async getProducts(collectionId: string) {
    console.warn("getProducts not implemented")
    const searchParams = new URLSearchParams()
    //searchParams.set('offset', ((page - 1) * PAGE_SIZE).toString())
    //searchParams.set('limit', String(PAGE_SIZE))
    searchParams.set('collection_id', collectionId)
    searchParams.set('region_id', BaseService.getRegionId())
    searchParams.set('fields', '+variants.calculated_price')

    const res = await this.get<{ products: any[] }>(
      `/store/products?` + searchParams.toString(),
    );

    return res.products.map((x) => {
      return {
        id: x?.id,
        products: transformProduct(x)
      }
    })
    //return ApiService.get(`/store/collections/${collectionId}/products?page=${page}&limit=${limit}`)
=======
  /**
   * List all collections
   */
  async list() {
    try {
      const res = await this.get<any[]>('/wp-json/wc/v3/products/categories', { per_page: 100 })
      return {
        data: res.map(transformWooCommerceCategory),
        count: res.length
      }
    } catch (error) {
      console.error('Error fetching collections:', error)
      return { data: [], count: 0 }
    }
  }

  /**
   * Get a single collection by slug
   */
  async getOne(slug: string) {
    const res = await this.get<any[]>('/wp-json/wc/v3/products/categories', { slug })
    if (!res.length) throw new Error('Collection not found')
    return transformWooCommerceCategory(res[0])
  }

  /**
   * Get a single collection by ID
   */
  async getById(id: string) {
    const res = await this.get<any>(`/wp-json/wc/v3/products/categories/${id}`)
    if (!res) throw new Error('Collection not found')
    return transformWooCommerceCategory(res)
>>>>>>> f348a1b (feat: product listing)
  }
}

export const collectionService = CollectionService.getInstance()
