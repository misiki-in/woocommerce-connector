import type { Category, Product, PaginatedResponse } from '../types'
import { BaseService } from './base-service'
import { transformProduct } from './product-service'

interface CategoryResponse {
  product_categories: Category[]
}

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
  }
}

export class CategoryService extends BaseService {
  private static instance:CategoryService 

  static getInstance(): CategoryService {
    if (!CategoryService.instance) {
      CategoryService.instance = new CategoryService()
    }
    return CategoryService.instance
  }

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
		const res = await this.get<CategoryResponse>(`/wp-json/wc/v3/products/categories?page=${page}&per_page=${limit}&search=${q}&orderby=${sort}`)
    return {
      page,
      data: res.product_categories?.map(transformCategory)
    }
	}

	// For storefront (public access)
	async fetchFeaturedCategories({ limit = 100 }: { limit?: number }) {
		const res = await this.get<CategoryResponse>(`/wp-json/wc/v3/products/categories?per_page=${limit}&hide_empty=false`)
    console.log("Featured categories", res)
    return {
      data: res.product_categories?.map(transformCategory)
    }
	}

	// For storefront (public access)
	async fetchCategory(id: string) {
		const res = await this.get<Category>(`/wp-json/wc/v3/products/categories/${id}`)
    return transformCategory(res)
	}

	// For storefront (public access)
	async fetchAllCategories({ limit = 100 }: { limit?: number }) {
		const res = await this.get<CategoryResponse>(`/wp-json/wc/v3/products/categories?per_page=${limit}&hide_empty=false`)
    return {
      data: res.product_categories?.map(transformCategory)
    }
	}

	// For storefront (public access)
	async fetchAllProductsOfCategory(id: string) {
    const res = await this.get<{ products: Product[] }>(`/wp-json/wc/v3/products?category=${id}`)
    return {
      data: res.products?.map(transformProduct)
    }
	}

	// For storefront (public access)
	async getMegamenu() {
		const res = await this.get<CategoryResponse>('/wp-json/wc/v3/products/categories?parent=0&hide_empty=false')
    return res.product_categories?.map(transformCategory)
	}
}

export const categoryService = CategoryService.getInstance()
