import type { PaginatedResponse } from '../types'
import { getPath } from '../mappers/generic.mapper'
import { BaseService, WP_API_BASE } from './base.service'

/**
 * Blog post, mirrored from @misiki/litekart-connector's `Blog` (src/types/content-types.ts).
 * Declared locally because the WooCommerce connector's src/types/index.ts only carries the
 * commerce types. `featuredImage`/`slug`/`excerpt` are additive conveniences.
 */
export type Blog = {
  id: string
  status: string | null
  title: string
  content: string
  user: string
  createdAt: string
  updatedAt: string
  slug?: string
  excerpt?: string
  featuredImage?: string | null
}

/**
 * WordPress `orderby` values accepted by GET /wp/v2/posts.
 * https://developer.wordpress.org/rest-api/reference/posts/#list-posts
 * There is no menu_order on posts (unlike pages).
 */
const POST_ORDERBY: Record<string, string> = {
  createdat: 'date', date: 'date',
  updatedat: 'modified', modifiedat: 'modified', modified: 'modified',
  title: 'title', name: 'title',
  slug: 'slug', id: 'id',
  relevance: 'relevance', author: 'author'
}

function wpSort(sort: string | undefined, search: string): { orderby: string; order: 'asc' | 'desc' } {
  const s = (sort || '').trim()
  const desc = s.startsWith('-')
  const key = (desc ? s.slice(1) : s).toLowerCase()
  let orderby = POST_ORDERBY[key] || 'date'
  // WP rejects `orderby=relevance` with 400 rest_no_search_term_defined unless `search` is
  // also sent, so it is only usable when the caller actually passed a query.
  if (orderby === 'relevance' && !search) orderby = 'date'
  return { orderby, order: !s || desc ? 'desc' : 'asc' }
}

function iso(gmt: unknown, fallback: unknown): string {
  if (typeof gmt === 'string' && gmt) return gmt.endsWith('Z') ? gmt : `${gmt}Z`
  return typeof fallback === 'string' ? fallback : ''
}

function rendered(raw: any, field: string): string {
  const v = getPath(raw, `${field}.rendered`)
  return typeof v === 'string' ? v : ''
}

function mapBlog(raw: any): Blog {
  // `_embed=1` inlines the author and the featured image; without it `author` and
  // `featured_media` are bare numeric ids.
  const author = getPath(raw, '_embedded.author.0.name')
  const media = getPath(raw, '_embedded.wp:featuredmedia.0.source_url')
  return {
    id: String(raw?.id ?? ''),
    status: raw?.status ?? null,
    title: rendered(raw, 'title'),
    content: rendered(raw, 'content'),
    user: String(author ?? raw?.author ?? ''),
    createdAt: iso(raw?.date_gmt, raw?.date),
    updatedAt: iso(raw?.modified_gmt, raw?.modified),
    slug: String(raw?.slug ?? ''),
    excerpt: rendered(raw, 'excerpt'),
    featuredImage: typeof media === 'string' ? media : null
  }
}

/** BlogService — WooCommerce/WordPress. Signatures mirror @misiki/litekart-connector. */
export class BlogService extends BaseService {
  private static instance: BlogService
  static getInstance(): BlogService { if (!BlogService.instance) BlogService.instance = new BlogService(); return BlogService.instance }

  /**
   * wp GET /wp/v2/posts — https://developer.wordpress.org/rest-api/reference/posts/
   * Anonymous callers see published posts only, which is the storefront's blog index.
   */
  async list({ page = 1, q = '', sort = '-createdAt' }: { page?: number; q?: string; sort?: string } = {}): Promise<PaginatedResponse<Blog>> {
    const { orderby, order } = wpSort(sort, q)
    const perPage = 20
    // The real totals are only in the X-WP-Total / X-WP-TotalPages response headers, which
    // plain request() discards; getPaged() reads them instead of guessing a page count.
    const { data: arr, total, totalPages } = await this.getPaged<any>(
      '/posts' + this.qs({ page, per_page: perPage, search: q, orderby, order, _embed: 1 }),
      WP_API_BASE
    )
    return { data: arr.map(mapBlog), count: total, pageSize: perPage, noOfPage: totalPages, page }
  }

  /**
   * wp GET /wp/v2/posts/{id} for a numeric id. WordPress core has NO /posts/{slug} route,
   * so a slug is resolved with GET /wp/v2/posts?slug=<slug> and the first hit is returned.
   */
  async getOne(id: string): Promise<Blog> {
    if (/^\d+$/.test(String(id))) return mapBlog(await this.wpGet<any>(`/posts/${id}` + this.qs({ _embed: 1 })))
    const raw = await this.wpGet<any>('/posts' + this.qs({ slug: id, per_page: 1, _embed: 1 }))
    const hit = Array.isArray(raw) ? raw[0] : raw
    if (!hit) throw { message: `Blog post "${id}" was not found.` }
    return mapBlog(hit)
  }
}

export const blogService = BlogService.getInstance()
