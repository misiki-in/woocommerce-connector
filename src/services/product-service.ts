import type { PaginatedResponse, Product, Variant } from '../types'
import { ProductStatus } from '../types'
import { mapProductGeneric } from '../mappers/generic.mapper'
import { BaseService } from './base.service'

/**
 * ProductService — WooCommerce. Signatures mirror @misiki/litekart-connector.
 *
 * Everything here is the authenticated v3 namespace (/wp-json/wc/v3):
 *   GET /products                       https://woocommerce.github.io/woocommerce-rest-api-docs/#list-all-products
 *   GET /products/{id}/variations       https://woocommerce.github.io/woocommerce-rest-api-docs/#product-variations
 *   POST /products/reviews              https://woocommerce.github.io/woocommerce-rest-api-docs/#create-a-product-review
 *
 * Two WooCommerce rules drive the shape of this file:
 *  - filters are QUERY params, path segments are numeric ids. There is no
 *    GET /products/{slug} on v3 — a slug lookup is `?slug=` + take the first row.
 *  - `per_page` defaults to 10 on every list route (max 100), so it is always passed.
 */

const FIELDS = { id: 'id', title: 'name', slug: 'slug', price: 'price', mrp: 'regular_price', description: 'description', image: 'images.0.src', stock: 'stock_quantity' } as const

/** Default page size. Mirrors the `pageSize` this connector reports back to callers. */
export const PRODUCT_PAGE_SIZE = 20
/** WooCommerce caps `per_page` at 100 on every list route. */
export const WOO_MAX_PER_PAGE = 100

const toNum = (v: unknown): number => {
  const n = typeof v === 'string' ? parseFloat(v) : (v as number)
  return Number.isFinite(n) ? n : 0
}

/** WordPress post status -> litekart ProductStatus. */
const STATUS_MAP: Record<string, ProductStatus> = {
  publish: ProductStatus.PUBLISHED,
  draft: ProductStatus.DRAFT,
  pending: ProductStatus.PROPOSED,
  private: ProductStatus.DRAFT,
  future: ProductStatus.DRAFT,
  trash: ProductStatus.REJECTED
}

/**
 * litekart sends sorting as a single `-field` token; WooCommerce always wants the pair
 * `orderby` + `order`. Allowed orderby values on /products are: date, modified, id,
 * include, title, slug, price, popularity, rating, menu_order (default date/desc).
 */
export function wooProductSort(sort?: string): { orderby: string; order: 'asc' | 'desc' } {
  const raw = (sort || '').trim()
  const order: 'asc' | 'desc' = raw.startsWith('-') ? 'desc' : 'asc'
  const field = raw.replace(/^-/, '')
  const map: Record<string, string> = {
    createdAt: 'date',
    created_at: 'date',
    date: 'date',
    updatedAt: 'modified',
    modified: 'modified',
    id: 'id',
    title: 'title',
    name: 'title',
    slug: 'slug',
    price: 'price',
    popularity: 'popularity',
    rating: 'rating',
    menuOrder: 'menu_order',
    position: 'menu_order'
  }
  const orderby = map[field]
  // Unknown token: fall back to WooCommerce's own default rather than sending a value
  // the REST controller will reject with rest_invalid_param.
  if (!orderby) return { orderby: 'date', order: 'desc' }
  return { orderby, order }
}

/**
 * Stable key for one product attribute, shared by the parent `options[]` and each variant's
 * `options[]` so the two can be matched by a variant picker.
 *
 * It must be `name`, NOT `id`: WooCommerce gives every CUSTOM (per-product) attribute
 * `id: 0` — the REST docs' own example is
 * `[{ "id": 6, "name": "Color", ... }, { "id": 0, "name": "Size", ... }]` — so keying on id
 * gives every custom attribute on a product the same key `"0"` and the picker can no longer
 * tell Size from Color. `name` is the only field present on BOTH shapes
 * (parent: id/name/position/visible/variation/options, variation: id/name/option), and it is
 * unique within a product. A non-zero global-attribute id is used only if the name is blank.
 */
function attrKey(a: any): string {
  const name = typeof a?.name === 'string' ? a.name.trim() : ''
  if (name) return name
  return a?.id ? String(a.id) : ''
}

/** Variation attributes come back as `{ id, name, option }`; parent attributes as `{ id, name, options[] }`. */
function mapVariantOptions(raw: any): { id: string; value: string }[] {
  const attrs: any[] = Array.isArray(raw?.attributes) ? raw.attributes : []
  return attrs.map((a) => ({ id: attrKey(a), value: String(a?.option ?? '') }))
}

/** Map a row of GET /products/{id}/variations into a litekart Variant. */
export function mapWooVariant(raw: any, productId: string): Variant {
  const options = mapVariantOptions(raw)
  return {
    id: String(raw?.id ?? ''),
    productId,
    title: options.map((o) => o.value).filter(Boolean).join(' / '),
    sku: raw?.sku || null,
    price: toNum(raw?.price ?? raw?.regular_price),
    mrp: toNum(raw?.regular_price) || toNum(raw?.price),
    stock: raw?.stock_quantity != null ? toNum(raw.stock_quantity) : raw?.stock_status === 'instock' ? 1 : 0,
    options
  }
}

/**
 * Map a WooCommerce v3 product into the litekart Product shape.
 *
 * mapProductGeneric() covers id/title/slug/price/mrp/description/image/stock; everything
 * below is data WooCommerce genuinely returns that the generic mapper hardcodes to null.
 * NOTE: v3 money is a decimal STRING ('19.99'), unlike the Store API which uses integer
 * minor units — do not feed Store API payloads through this function.
 */
export function mapWooProduct(raw: any, opts: { storeId?: string } = {}): Product {
  const base = mapProductGeneric(raw, FIELDS, opts)
  const images: string[] = (Array.isArray(raw?.images) ? raw.images : []).map((i: any) => i?.src).filter(Boolean)
  const dims = raw?.dimensions || {}
  const attrs: any[] = Array.isArray(raw?.attributes) ? raw.attributes : []
  return {
    ...base,
    active: raw?.status ? raw.status === 'publish' : base.active,
    status: STATUS_MAP[String(raw?.status)] ?? base.status,
    type: raw?.virtual || raw?.downloadable ? 'digital' : 'physical',
    // A WooCommerce product can sit in several categories; litekart Product holds one.
    categoryId: raw?.categories?.[0]?.id != null ? String(raw.categories[0].id) : null,
    images: images.length ? JSON.stringify(images) : base.images,
    featuredImage: images[0] ?? base.featuredImage,
    thumbnail: images[0] ?? base.thumbnail,
    link: raw?.permalink ?? null,
    sku: raw?.sku || null,
    subtitle: raw?.short_description || null,
    // `total_sales` is WooCommerce's own popularity metric (read-only, computed from orders).
    popularity: toNum(raw?.total_sales),
    rank: toNum(raw?.menu_order),
    // WooCommerce only reports a stock NUMBER when manage_stock is on; otherwise all it
    // knows is stock_status, so availability is reported as 1/0 and manageInventory=false.
    stock: raw?.stock_quantity != null ? toNum(raw.stock_quantity) : raw?.stock_status === 'instock' ? 1 : 0,
    manageInventory: !!raw?.manage_stock,
    allowBackorder: raw?.backorders ? raw.backorders !== 'no' : false,
    weight: raw?.weight ? toNum(raw.weight) : null,
    height: dims?.height ? toNum(dims.height) : null,
    width: dims?.width ? toNum(dims.width) : null,
    len: dims?.length ? toNum(dims.length) : null,
    shippingWeight: raw?.weight ? toNum(raw.weight) : null,
    shippingHeight: dims?.height ? toNum(dims.height) : null,
    shippingWidth: dims?.width ? toNum(dims.width) : null,
    shippingLen: dims?.length ? toNum(dims.length) : null,
    // Only attributes flagged `variation: true` drive the variant picker.
    options: attrs
      .filter((a) => a?.variation)
      .map((a) => ({
        // attrKey(), not `id` — custom attributes are all `id: 0`. See attrKey().
        id: attrKey(a),
        title: String(a?.name ?? ''),
        type: 'select',
        values: (Array.isArray(a?.options) ? a.options : []).map((v: any) => ({ id: String(v), value: String(v) }))
      })),
    variants: []
  }
}

/** ProductService — WooCommerce. Signatures mirror @misiki/litekart-connector. */
export class ProductService extends BaseService {
  private static instance: ProductService
  static getInstance(): ProductService { if (!ProductService.instance) ProductService.instance = new ProductService(); return ProductService.instance }

  /** Shared GET /products call: real query string, real totals from X-WP-Total(-Pages). */
  protected async queryProducts(params: Record<string, unknown>, page: number, perPage: number = PRODUCT_PAGE_SIZE): Promise<PaginatedResponse<Product>> {
    const res = await this.getPaged<any>('/products' + this.qs({ page, per_page: perPage, ...params }))
    return {
      data: res.data.map((x) => mapWooProduct(x, { storeId: this.creds.storeId })),
      count: res.total,
      pageSize: perPage,
      noOfPage: res.totalPages,
      page
    }
  }

  /**
   * GET /products?search=&orderby=&order=&status=publish
   * `status` defaults to `any` on v3, which would leak drafts to a storefront.
   */
  async list({ page = 1, search = '', sort = '-createdAt' }: { page?: number; search?: string; sort?: string } = {}): Promise<PaginatedResponse<Product>> {
    const { orderby, order } = wooProductSort(sort)
    return this.queryProducts({ search, orderby, order, status: 'publish' }, page)
  }

  /** GET /products?featured=true — `featured` is a real boolean filter on v3, not an approximation. */
  async listFeaturedProducts({ page = 1, sort = '-createdAt' }: { page?: number; sort?: string } = {}): Promise<PaginatedResponse<Product>> {
    const { orderby, order } = wooProductSort(sort)
    return this.queryProducts({ featured: true, orderby, order, status: 'publish' }, page)
  }

  /**
   * GET /products?orderby=popularity — WooCommerce sorts by `total_sales`.
   * (WooCommerce ignores `order` for popularity/rating, so this is always effectively desc.)
   */
  async listTrendingProducts({ page = 1, search = '', sort = '-createdAt' }: { page?: number; search?: string; sort?: string } = {}): Promise<PaginatedResponse<Product>> {
    void sort
    return this.queryProducts({ search, orderby: 'popularity', order: 'desc', status: 'publish' }, page)
  }

  /**
   * GET /products?category={termId} — v3 has no `related` param (the Store API does:
   * store GET /products?related={id}), so "related" means "same category".
   * `categoryId` may be a numeric term id or a category slug; slugs are resolved first.
   */
  async listRelatedProducts({ page = 1, categoryId = '', sort = '-createdAt', exclude = '' }: { page?: number; categoryId?: string; sort?: string; exclude?: string } = {}): Promise<PaginatedResponse<Product>> {
    const { orderby, order } = wooProductSort(sort)
    const termId = await this.resolveCategoryId(categoryId)
    if (categoryId && !termId) return { data: [], count: 0, pageSize: PRODUCT_PAGE_SIZE, noOfPage: 0, page }
    return this.queryProducts({ category: termId, exclude, orderby, order, status: 'publish' }, page)
  }

  /**
   * Resolve a category slug to the numeric TERM id v3 requires.
   * On v3 `category=` takes an id, never a slug (the Store API is the opposite) —
   * https://woocommerce.github.io/woocommerce-rest-api-docs/#list-all-product-categories
   */
  protected async resolveCategoryId(idOrSlug: string): Promise<string> {
    if (!idOrSlug) return ''
    if (/^\d+$/.test(idOrSlug)) return idOrSlug
    const rows = await this.get<any[]>('/products/categories' + this.qs({ slug: idOrSlug, per_page: 1 }))
    return Array.isArray(rows) && rows[0]?.id != null ? String(rows[0].id) : ''
  }

  /**
   * GET /products?slug={slug} then take [0] — v3 has NO /products/{slug} route; the path
   * segment must be a numeric id (a slug returns woocommerce_rest_product_invalid_id).
   * Variable products are completed with GET /products/{id}/variations, because the parent
   * payload carries only a `variations: [ids]` array — no variation prices or stock.
   */
  async getOne(slug: string): Promise<Product> {
    let raw: any
    if (/^\d+$/.test(String(slug))) {
      raw = await this.get<any>('/products/' + slug)
    } else {
      const rows = await this.get<any[]>('/products' + this.qs({ slug, per_page: 1, status: 'publish' }))
      raw = Array.isArray(rows) ? rows[0] : rows
    }
    if (!raw || !raw.id) throw { message: `Product "${slug}" was not found.` }
    const product = mapWooProduct(raw, { storeId: this.creds.storeId })
    if (Array.isArray(raw.variations) && raw.variations.length > 0) {
      // per_page=100 is the WooCommerce maximum (the default of 10 silently truncates), and
      // 100 truncates too on products with more variations than that. `raw.variations` is the
      // exact id list, so the page count is known up front rather than guessed.
      const pages = Math.ceil(raw.variations.length / WOO_MAX_PER_PAGE)
      const rows: any[] = []
      for (let page = 1; page <= pages; page++) {
        const chunk = await this.get<any[]>(`/products/${raw.id}/variations` + this.qs({ per_page: WOO_MAX_PER_PAGE, page }))
        if (!Array.isArray(chunk) || chunk.length === 0) break
        rows.push(...chunk)
      }
      product.variants = rows.map((v) => mapWooVariant(v, product.id))
    }
    return product
  }

  /**
   * POST /products/reviews.
   * WooCommerce requires `reviewer` and `reviewer_email` on top of litekart's arguments —
   * they are accepted as optional extras here; without them WooCommerce replies
   * "Missing parameter(s): reviewer, reviewer_email" rather than this connector guessing.
   * `variantId` and `uploadedImages` have no home on a WooCommerce review (reviews are
   * per-product and carry no attachments), so they are deliberately not sent.
   */
  async addReview({ productId, variantId, review, rating, uploadedImages, reviewer, reviewerEmail, status }: {
    productId: string
    variantId?: string
    review: string
    rating: number
    uploadedImages?: string[]
    reviewer?: string
    reviewerEmail?: string
    status?: 'approved' | 'hold' | 'spam' | 'unspam' | 'trash' | 'untrash'
  }) {
    void variantId; void uploadedImages
    return this.post('/products/reviews', {
      product_id: Number(productId),
      review,
      rating,
      reviewer,
      reviewer_email: reviewerEmail,
      status
    })
  }

  /** Not supported: WooCommerce core and WP core expose no video/reels resource. */
  async fetchReels() { return this.dummy([] as unknown[]) }
}
export const productService = ProductService.getInstance()
