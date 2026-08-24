import { BaseService } from './base.service'

/** Menu, mirrored from the storefront contract's `Menu`. */
export type Menu = {
  id: string
  active: boolean
  name: string | null
  menuId: string | null
  link: string | null
  items: Record<string, unknown>[]
  storeId: string
  userId: string | null
  createdAt: string
  updatedAt: string
}

type WooTerm = { id?: number; name?: string; slug?: string; parent?: number; count?: number; menu_order?: number }

/**
 * MenuService — WooCommerce. Signatures mirror the storefront contract.
 */
export class MenuService extends BaseService {
  private static instance: MenuService
  static getInstance(): MenuService { if (!MenuService.instance) MenuService.instance = new MenuService(); return MenuService.instance }

  /**
   * WordPress's own navigation menus (wp GET /wp/v2/menus and /wp/v2/menu-items, WP 5.9+)
   * are NOT reachable from this connector: they require a WordPress user with
   * `edit_theme_options`, and the ck/cs Basic header authenticates WooCommerce only — WP core
   * answers 401 rest_cannot_view. Until WP Application Password credentials are added, the
   * menu is built from the catalogue instead, which needs no extra auth:
   *   v3 GET /products/categories?parent=0  https://woocommerce.github.io/woocommerce-rest-api-docs/#product-categories
   *   wp GET /wp/v2/pages                   https://developer.wordpress.org/rest-api/reference/pages/
   * per_page is explicit — terms default to 10 per page (max 100). Terms sort by name asc,
   * pages by menu_order asc, matching how each is ordered in wp-admin.
   */
  async list(): Promise<Menu[]> {
    const [top, children, pages] = await Promise.all([
      this.get<WooTerm[]>('/products/categories' + this.qs({ parent: 0, per_page: 100, hide_empty: true, orderby: 'name', order: 'asc' })),
      this.get<WooTerm[]>('/products/categories' + this.qs({ per_page: 100, hide_empty: true, orderby: 'name', order: 'asc' })),
      this.wpGet<any[]>('/pages' + this.qs({ per_page: 100, orderby: 'menu_order', order: 'asc' })).catch(() => [] as any[])
    ])

    const childrenOf = (parentId: number) =>
      (Array.isArray(children) ? children : [])
        .filter((c) => Number(c?.parent) === parentId)
        .map((c) => ({ id: String(c?.id ?? ''), name: c?.name ?? '', slug: c?.slug ?? '', link: `/category/${c?.slug ?? ''}`, count: c?.count ?? 0, items: [] as Record<string, unknown>[] }))

    const now = new Date().toISOString()
    const storeId = this.creds.storeId || this.creds.apiUrl || ''

    const categoryMenu: Menu = {
      // Synthetic id: WooCommerce has no menu resource, so there is no server-side id to use.
      id: 'product-categories',
      active: true,
      name: 'Categories',
      menuId: 'product-categories',
      link: null,
      items: (Array.isArray(top) ? top : []).map((t) => ({
        id: String(t?.id ?? ''),
        name: t?.name ?? '',
        slug: t?.slug ?? '',
        link: `/category/${t?.slug ?? ''}`,
        count: t?.count ?? 0,
        items: childrenOf(Number(t?.id))
      })),
      storeId,
      userId: null,
      createdAt: now,
      updatedAt: now
    }

    const pageMenu: Menu = {
      id: 'pages',
      active: true,
      name: 'Pages',
      menuId: 'pages',
      link: null,
      items: (Array.isArray(pages) ? pages : []).map((p) => ({
        id: String(p?.id ?? ''),
        name: p?.title?.rendered ?? '',
        slug: p?.slug ?? '',
        link: `/${p?.slug ?? ''}`,
        items: [] as Record<string, unknown>[]
      })),
      storeId,
      userId: null,
      createdAt: now,
      updatedAt: now
    }

    return pageMenu.items.length ? [categoryMenu, pageMenu] : [categoryMenu]
  }
}

export const menuService = MenuService.getInstance()
