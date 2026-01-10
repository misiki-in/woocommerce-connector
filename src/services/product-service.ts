import { PAGE_SIZE } from '../config'
import { ProductStatus, Variant, type Product } from '../types'
import { BaseService } from './base-service'

// WooCommerce API returns products directly, not wrapped in a response object
type ProductListResponse = Product[]
type ProductResponse = Product

export function transformOption(option: any): any {
  return {
    ...option,
    productId: option.product_id,
    values: option.values.map((x: any) => ({
      ...x,
      optionId: option.id,
    }))
  }
}

export function transformProduct(product: Product): any {
  const rawThumbnail = product.images && product.images[0]?.src || ''
  const rawImages = product.images ? product.images.map((img: any) => img.src) : []

  // Validate raw URLs
  if (!rawThumbnail && !rawImages.length) {
    console.warn('No valid image URLs found for product:', product.id)
  }

  return {
    id: product.id.toString(),
    status: product.status === 'publish' ? ProductStatus.PUBLISHED : ProductStatus.DRAFT,
    active: product.status === 'publish',
    allowBackorder: product.backorders_allowed,
    price: parseFloat(product.price) || 0,
    mrp: parseFloat(product.regular_price) || parseFloat(product.price) || 0,
    title: product.name,
    thumbnail: rawThumbnail,
    slug: product.slug,
    handle: product.slug,
    description: product.description,
    images: rawImages.join(','),
    variants: [], // WooCommerce handles variants differently
    options: [],
    attributes: product.attributes || [],
    tags: product.tags?.map((tag: any) => tag.name) || [],
    sku: product.sku,
    stock: product.stock_quantity || 0,
    manageInventory: product.manage_stock,
    weight: parseFloat(product.weight) || null,
    categories: product.categories?.map((cat: any) => cat.id) || [],
    featured: product.featured
  }
}

export class ProductService extends BaseService {
  private static instance: ProductService

  static getInstance(): ProductService {
    if (!ProductService.instance) {
      ProductService.instance = new ProductService()
    }
    return ProductService.instance
  }
  /**
    * List featured products
  * @param page - Page number (default: 1)
  * @returns Paginated response of featured products
  */
  async listFeaturedProducts({ page = 1 } = {}) {
    const search = ''
    return this.list({ page, search })
  }

  /**
    * List trending products
  * @param page - Page number (default: 1)
  * @param search - Additional search term (default: '')
  * @returns Paginated response of trending products
  */
  async listTrendingProducts({ page = 1, search = '' } = {}) {
    const q = ''
    return this.list({ page, search: `${q} ${search}` })
  }

  /**
    * List related products by category
  * @param page - Page number (default: 1)
  * @param categoryId - Category ID to filter by (default: '')
  * @returns Paginated response of related products
  */
  async listRelatedProducts({ page = 1, categoryId = '' } = {}) {
    return this.list({ page, categories: categoryId })
  }

  /**
    * List all products with optional filters
  * @param page - Page number (default: 1)
  * @param search - Search query (default: '')
  * @param categories - Category ID filter (default: '')
  * @returns Paginated response of products
  */
  async list({ page = 1, search = '', categories = '' } = {}) {
    const searchParams = new URLSearchParams()
    searchParams.set('page', page.toString())
    searchParams.set('per_page', String(PAGE_SIZE))
    if (search) {
      searchParams.set('search', search)
    }
    if (categories) {
      searchParams.set('category', categories)
    }
    searchParams.set('status', 'publish')

    try {
      const products = await this.get<ProductListResponse>(
        `/wp-json/wc/v3/products?` + searchParams.toString(),
      );

      console.log('Raw WooCommerce API Response for list:', products, 'Params:', searchParams)

      if (!Array.isArray(products)) {
        throw new Error('Invalid products data in API response: products is not an array')
      }

      const data = products.map(transformProduct)

      return {
        products,
        count: products.length,
        offset: (page - 1) * PAGE_SIZE,
        limit: PAGE_SIZE,
        data
      }
    } catch (error: any) {
      console.error('Error fetching WooCommerce products:', error)
      const data = [
        {
          id: 'error-placeholder',
          title: 'Error Product',
          thumbnail: 'https://via.placeholder.com/200',
          price: 0,
          mrp: 0,
          handle: 'error',
          description: 'Failed to load product data',
          images: ['https://via.placeholder.com/200'],
          variants: [],
          options: []
        }
      ]

      return {
        products: [],
        count: 0,
        offset: 0,
        limit: PAGE_SIZE,
        data
      }
    }
  }

  /**
    * Get a single product by handle
  * @param handle - Product handle (slug)
  * @returns Product details
  */
  async getOne(handle: string) {
    try {
      const searchParams = new URLSearchParams()
      searchParams.set('slug', handle)
      searchParams.set('status', 'publish')
      
      const resData = await this.get<Product[]>(`/wp-json/wc/v3/products?` + searchParams.toString())

      console.log('Raw WooCommerce API Response for getOne:', resData, 'Handle:', handle)

      const product = resData[0]
      if (!product) throw new Error('Product not found with slug: ' + handle)

      return transformProduct(product)
    } catch (error: any) {
      console.error('Error fetching WooCommerce product:', error)
      return {
        id: 'error-placeholder',
        title: 'Error Product',
        thumbnail: 'https://via.placeholder.com/200',
        images: ['https://via.placeholder.com/200'],
        price: 0,
        mrp: 0,
        handle: 'error',
        description: 'Failed to load product data',
        variants: [],
        options: []
      }
    }
  }

  /**
   * Add a review for a product
   * Note: WooCommerce doesn't have built-in reviews API in v3, this would need a custom endpoint or plugin
   * @param productId - ID of the product
   * @param variantId - ID of the variant
   * @param review - Review text
   * @param rating - Rating value
   * @param uploadedImages - Array of image URLs
   * @returns Response from the API
   * @todo: Implement custom reviews endpoint or use WooCommerce reviews plugin API
   */
  /*
    async addReview({
    productId,
    variantId,
    review,
    rating,
    uploadedImages
  }: {
    productId: string
    variantId: string
    review: string
    rating: number
    uploadedImages: string[]
  }) {
    try {
      //@todo: after verifying with custom reviews API, implement proper types for the response
      const response: any = await this.post(`/wp-json/wc/v3/products/${productId}/reviews`, {
        variant_id: variantId,
        review,
        rating,
        uploaded_images: uploadedImages
      })
      console.log('addReview response:', response?.data, 'Request URL:', response?.config?.url)
      return response?.data
    } catch (error) {
      const axiosError = error as AxiosError
      console.error(
        "Error adding review:",
        axiosError?.response?.data || axiosError?.message,
        "Request Config:",
        axiosError?.config
      );
      throw new Error('Failed to add review')
    }
  }
  */

  /**
   * Fetch reels (not supported in WooCommerce)
   * Note: This would need a custom implementation
   */
  /*
    async fetchReels() {
    try {
      const resData = await this.get(`/wp-json/wc/v3/custom/reels`)
      console.log('fetchReels response:', resData)
      return resData
    } catch (error) {
      const axiosError = error as AxiosError
      console.error(
        "Error fetching reels:",
        axiosError?.response?.data || axiosError?.message,
        "Request Config:",
        axiosError?.config
      );
      throw new Error('Failed to fetch reels')
    }
  }
  */
}

export const productService = ProductService.getInstance()
