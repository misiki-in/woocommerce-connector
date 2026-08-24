import type { PaginatedResponse } from '../types'
import { getPath } from '../mappers/generic.mapper'
import { BaseService, WP_API_BASE } from './base.service'

/**
 * Content page, mirrored from the storefront contract's `Page`.
 * Declared locally because the WooCommerce connector's src/types/index.ts only carries the
 * commerce types (Product, Category, Order, ...).
 */
export type Page = {
  id: string
  name: string
  slug: string
  content?: string
  metaDescription?: string
  metaKeywords?: string
  createdAt: string
  updatedAt: string
  desktopBanners?: Record<string, unknown>[]
  metaTitle?: string
  mobileBanners: Record<string, unknown>[]
  rank?: number
  sections?: Record<string, unknown>[]
  status: string
  type: string
}

/**
 * WordPress `orderby` values accepted by GET /wp/v2/pages.
 * https://developer.wordpress.org/rest-api/reference/pages/#list-pages
 * The storefront passes a single signed field ('-createdAt'); WP wants the pair orderby + order.
 */
const PAGE_ORDERBY: Record<string, string> = {
  createdat: 'date', date: 'date',
  updatedat: 'modified', modifiedat: 'modified', modified: 'modified',
  title: 'title', name: 'title',
  slug: 'slug', id: 'id',
  rank: 'menu_order', menuorder: 'menu_order'
}

function wpSort(sort: string | undefined, map: Record<string, string>): { orderby: string; order: 'asc' | 'desc' } {
  const s = (sort || '').trim()
  const desc = s.startsWith('-')
  const key = (desc ? s.slice(1) : s).toLowerCase()
  return { orderby: map[key] || 'date', order: !s || desc ? 'desc' : 'asc' }
}

/** WP returns naive UTC strings in `*_gmt` fields; make them unambiguous ISO-8601. */
function iso(gmt: unknown, fallback: unknown): string {
  if (typeof gmt === 'string' && gmt) return gmt.endsWith('Z') ? gmt : `${gmt}Z`
  return typeof fallback === 'string' ? fallback : ''
}

/** WP `title`/`content`/`excerpt` are objects — the text lives on `.rendered`. */
function rendered(raw: any, field: string): string {
  const v = getPath(raw, `${field}.rendered`)
  return typeof v === 'string' ? v : ''
}

function mapPage(raw: any): Page {
  return {
    id: String(raw?.id ?? ''),
    name: rendered(raw, 'title'),
    slug: String(raw?.slug ?? ''),
    content: rendered(raw, 'content'),
    metaDescription: rendered(raw, 'excerpt'),
    // WP core exposes no meta description/keywords fields; SEO plugins store them in `meta`,
    // and their keys are plugin-specific, so we do not guess one.
    metaKeywords: undefined,
    createdAt: iso(raw?.date_gmt, raw?.date),
    updatedAt: iso(raw?.modified_gmt, raw?.modified),
    desktopBanners: [],
    metaTitle: rendered(raw, 'title'),
    mobileBanners: [],
    rank: typeof raw?.menu_order === 'number' ? raw.menu_order : 0,
    sections: [],
    status: String(raw?.status ?? 'publish'),
    type: String(raw?.type ?? 'page')
  }
}

/** PageService — WooCommerce/WordPress. Signatures mirror the storefront contract. */
export class PageService extends BaseService {
  private static instance: PageService
  static getInstance(): PageService { if (!PageService.instance) PageService.instance = new PageService(); return PageService.instance }

  /**
   * wp GET /wp/v2/pages — https://developer.wordpress.org/rest-api/reference/pages/
   * Only `status=publish` is visible to an anonymous caller (the ck/cs Basic header does not
   * authenticate WordPress core), which is exactly what a storefront wants.
   */
  async list({ page = 1, search = '', sort = '-createdAt' }: { page?: number; search?: string; sort?: string } = {}): Promise<Page[]> {
    const { orderby, order } = wpSort(sort, PAGE_ORDERBY)
    const raw = await this.wpGet<any>('/pages' + this.qs({ page, per_page: 20, search, orderby, order }))
    const arr: any[] = Array.isArray(raw) ? raw : []
    return arr.map(mapPage)
  }

  /**
   * wp GET /wp/v2/pages?orderby=modified&order=desc&per_page=10 — most recently updated pages.
   * The storefront's listLatestPages sorts by `-updatedAt`, which is WP's `modified`, not `date`.
   * Totals come from the X-WP-Total / X-WP-TotalPages headers via getPaged(), not from the
   * length of the slice we asked for.
   */
  async listLatestPages(_opts: Record<string, unknown> = {}): Promise<PaginatedResponse<Page>> {
    void _opts
    const { data: arr, total, totalPages } = await this.getPaged<any>(
      '/pages' + this.qs({ orderby: 'modified', order: 'desc', per_page: 10 }),
      WP_API_BASE
    )
    return { data: arr.map(mapPage), count: total, pageSize: 10, noOfPage: totalPages, page: 1 }
  }

  /**
   * wp GET /wp/v2/pages/{id} for a numeric id. WordPress core has NO /pages/{slug} route,
   * so a slug is resolved with GET /wp/v2/pages?slug=<slug> and the first hit is returned.
   */
  async getOne(id: string): Promise<Page> {
    if (/^\d+$/.test(String(id))) return mapPage(await this.wpGet<any>(`/pages/${id}`))
    const raw = await this.wpGet<any>('/pages' + this.qs({ slug: id, per_page: 1 }))
    const hit = Array.isArray(raw) ? raw[0] : raw
    if (!hit) throw { message: `Page "${id}" was not found.` }
    return mapPage(hit)
  }
}

export const pageService = PageService.getInstance()
