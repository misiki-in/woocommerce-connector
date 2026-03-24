<<<<<<< HEAD
import type { Category, Product, PaginatedResponse } from '../types'
import { BaseService } from './base-service'
import { transformProduct } from './product-service'
import { PAGE_SIZE } from '../config'

// WooCommerce API returns categories directly as an array, not wrapped in an object
type CategoryListResponse = Category[]
type CategoryResponse = Category

type CategoryExtended = {
  children: CategoryExtended[] | null
  parent: CategoryExtended | null
  id: string
  slug: string
  name: string
  parentCategoryId: string | null
  createdAt: string
  description: string
  thumbnail: string | null
  link: string | null
  isActive: boolean
}

export function transformCategory(cat: Category): CategoryExtended {
  return {
    id: cat?.id.toString(),
    slug: cat?.slug,
    name: cat?.name,
    parentCategoryId: cat?.parent === 0 ? null : cat?.parent.toString(),
    createdAt: cat?.image?.date_created || '',
    description: cat?.description,
    children: null, // WooCommerce doesn't provide children in basic category response
    parent: null, // WooCommerce doesn't provide parent in basic category response
    thumbnail: cat?.image?.src || null,
    link: null,
    isActive: true,
=======
import { BaseService } from './base-service.js'
import type { Category, PaginatedResponse } from '../types/index.js'

export function transformWooCommerceCategory(wc: any): Category {
  return {
    id: wc.id.toString(),
    isActive: true,
    isInternal: false,
    isMegamenu: false,
    thumbnail: wc.image?.src || null,
    path: wc.slug,
    level: 0,
    description: wc.description || null,
    isFeatured: false,
    keywords: null,
    rank: wc.menu_order || 0,
    link: `/category/${wc.slug}`,
    metaDescription: null,
    metaKeywords: null,
    metaTitle: wc.name,
    name: wc.name,
    parentCategoryId: wc.parent ? wc.parent.toString() : null,
    store: null,
    slug: wc.slug,
    userId: '',
    activeProducts: wc.count || 0,
    inactiveProducts: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
>>>>>>> f348a1b (feat: product listing)
  }
}

export class CategoryService extends BaseService {
<<<<<<< HEAD
  private static instance:CategoryService 
=======
  private static instance: CategoryService
>>>>>>> f348a1b (feat: product listing)

  static getInstance(): CategoryService {
    if (!CategoryService.instance) {
      CategoryService.instance = new CategoryService()
    }
    return CategoryService.instance
  }

<<<<<<< HEAD
	// For storefront (public access)
	async fetchFooterCategories({
		page = 1,
		q = '',
		sort = 'name',
		limit = 20
	}: {
		page?: number
		q?: string
		sort?: string
		limit?: number
	}) {
		const res = await this.get<CategoryListResponse>(`/wp-json/wc/v3/products/categories?page=${page}&per_page=${limit}&search=${q}&orderby=${sort}`)
    return {
      page,
      data: res.map(transformCategory)
    }
	}

	// For storefront (public access)
	async fetchFeaturedCategories({ limit = 100 }: { limit?: number }) {
		const res = await this.get<CategoryListResponse>(`/wp-json/wc/v3/products/categories?per_page=${limit}&hide_empty=false`)
    console.log("Featured categories", res)
    return {
      data: res.map(transformCategory)
    }
	}

	// For storefront (public access)
	async fetchCategory(id: string) {
		const res = await this.get<Category>(`/wp-json/wc/v3/products/categories/${id}`)
    return transformCategory(res)
	}

	// For storefront (public access)
	async fetchAllCategories({ limit = 100 }: { limit?: number }) {
		const res = await this.get<CategoryListResponse>(`/wp-json/wc/v3/products/categories?per_page=${limit}&hide_empty=false`)
    return {
      data: res.map(transformCategory)
    }
	}

	// For storefront (public access)
	async fetchAllProductsOfCategory(id: string) {
    const res = await this.get<Product[]>(`/wp-json/wc/v3/products?category=${id}`)
    return {
      data: res.map(transformProduct)
    }
	}

	// For storefront (public access)
	async getMegamenu() {
		const res = await this.get<CategoryListResponse>('/wp-json/wc/v3/products/categories?parent=0&hide_empty=false')
    return res.map(transformCategory)
	}
=======
  async list(): Promise<PaginatedResponse<Category>> {
    try {
      const res = await this.get<any[]>('/wp-json/wc/store/v1/products/categories', { per_page: 100 })
      return {
        data: res.map(transformWooCommerceCategory),
        count: res.length,
        pageSize: 100,
        noOfPage: 1,
        page: 1
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      return { data: [], count: 0, pageSize: 100, noOfPage: 1, page: 1 }
    }
  }

  async getMegamenu(): Promise<PaginatedResponse<Category>> {
    return this.list()
  }

  async getOne(slug: string) {
    const list = await this.list()
    const cat = list.data.find(c => c.slug === slug)
    if (!cat) throw new Error('Category not found')
    return cat
  }
>>>>>>> f348a1b (feat: product listing)
}

export const categoryService = CategoryService.getInstance()
