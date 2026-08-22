import type { PaginatedResponse } from '../types'
import { BaseService } from './base.service'

/** Banner, mirrored from @misiki/litekart-connector's `Banner` (src/types/content-types.ts). */
export type Banner = {
  id: string
  active: boolean
  demo: boolean
  groupId: string | null
  groupTitle: string | null
  heading: string | null
  img: string
  imgCdn: string | null
  link: string | null
  pageId: string
  pageType: string | null
  isLinkExternal: boolean | null
  sort: number | null
  storeId: number
  userId: number | null
  type: string
  isMobile: boolean
  description: string | null
  title: string | null
  bannerId: number | null
  fieldGrid: number | null
  scroll: boolean | null
  createdAt: string
  updatedAt: string
}

/**
 * BannerService — no WooCommerce mapping.
 *
 * Neither WooCommerce (wc/v3), the Store API (wc/store/v1) nor WordPress core (wp/v2) has a
 * banner or slider resource. The nearest generic surface, wp GET /wp/v2/media, is a media
 * library, not an ordered banner set, and slider plugins (Smart Slider, MetaSlider, ...)
 * register their own custom post types whose REST slugs are site-specific — hardcoding one
 * would 404 in every store that does not run that exact plugin. Placeholders stay until the
 * connector is given a configurable banner source.
 */
export class BannerService extends BaseService {
  private static instance: BannerService
  static getInstance(): BannerService { if (!BannerService.instance) BannerService.instance = new BannerService(); return BannerService.instance }

  /** No banner resource exists in WooCommerce/WordPress core — returns an empty page. */
  async list(): Promise<PaginatedResponse<Banner>> { return this.emptyPage<Banner>() }

  /** No banner-group concept exists either (grouping is a slider-plugin notion). */
  async fetchBannersGroup(): Promise<PaginatedResponse<Banner>> { return this.emptyPage<Banner>() }
}

export const bannerService = BannerService.getInstance()
