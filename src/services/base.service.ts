import { isRestPath, resolveRestLocally } from './rest-guard'
import type { Credentials } from '../config'

/**
 * BaseService — shared REST client for the WooCommerce connector.
 * - Credentials via static setCredentials (client + server hooks), not constructors.
 * - Server-side: constructed with a custom fetch (cookies). Client-side: singletons.
 * - Unsuccessful responses THROW the parsed body (always carrying `message`).
 * - refreshCredentials() is an overridable hook for vendors with short-lived tokens.
 */
/** Authenticated WooCommerce REST API (products, orders, coupons, customers). */
export const API_BASE = '/wp-json/wc/v3'
/** Public WooCommerce Store API (cart, checkout) — session-based, no consumer key. */
export const STORE_API_BASE = '/wp-json/wc/store/v1'
/** WordPress core REST API (pages, posts, media). */
export const WP_API_BASE = '/wp-json/wp/v2'

export class BaseService {
  private static _credentials: Credentials = { apiUrl: '' }
  protected _fetch: typeof fetch
  constructor(fetchFn?: typeof fetch) { this._fetch = fetchFn || (globalThis.fetch as typeof fetch) }

  static setCredentials(creds: Partial<Credentials>): void {
    BaseService._credentials = { ...BaseService._credentials, ...creds }
  }
  static getCredentials(): Credentials { return BaseService._credentials }
  protected get creds(): Credentials { return BaseService._credentials }

  protected authHeaders(): Record<string, string> { return { Authorization: `Basic ${btoa(`${this.creds.apiKey ?? ''}:${this.creds.apiSecret ?? ''}`)}` } }

  /**
   * WooCommerce exposes several REST namespaces. Product/order/coupon data lives under
   * the authenticated v3 API, while cart and checkout are only available on the public
   * Store API. `base` selects the namespace; it defaults to API_BASE (v3).
   */
  protected url(path: string, base: string = API_BASE): string {
    const root = (this.creds.apiUrl || '').replace(/\/$/, '') + base
    return root + path
  }

  /** Build `?a=1&b=2` from a param bag, dropping empty values. */
  protected qs(params: Record<string, unknown>): string {
    const sp = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null || v === '') continue
      sp.append(k, String(v))
    }
    const s = sp.toString()
    return s ? `?${s}` : ''
  }

  protected async request<T = any>(path: string, init: RequestInit = {}, _retried = false, base: string = API_BASE): Promise<T> {
    // Storefront REST paths this connector inherits — `/api/menu`, `/api/pages/*`,
    // `/api/ms-autocomplete/*` and the rest — have no WooCommerce equivalent, and there is no such
    // API behind this store to answer them. See rest-guard.ts.
    if (isRestPath(path)) return (await resolveRestLocally(String(init?.method ?? 'GET').toLowerCase(), path)) as T
    let res: Response
    try {
      res = await this._fetch(this.url(path, base), {
        ...init,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...this.authHeaders(), ...(init.headers as any) }
      })
    } catch { throw { message: 'Unable to reach the server. Please try again in a moment.' } }
    if (res.status === 401 && !_retried && (await this.refreshCredentials())) return this.request<T>(path, init, true, base)
    if (!res.ok) throw this.toError(await this.safeJson(res), `Request failed with status ${res.status}`)
    if (res.status === 204) return undefined as T
    return (await this.safeJson(res)) as T
  }
  get<T = any>(path: string) { return this.request<T>(path, { method: 'GET' }) }
  post<T = any>(path: string, data?: unknown) { return this.request<T>(path, { method: 'POST', body: data === undefined ? undefined : JSON.stringify(data) }) }
  put<T = any>(path: string, data?: unknown) { return this.request<T>(path, { method: 'PUT', body: data === undefined ? undefined : JSON.stringify(data) }) }
  patch<T = any>(path: string, data?: unknown) { return this.request<T>(path, { method: 'PATCH', body: data === undefined ? undefined : JSON.stringify(data) }) }
  delete<T = any>(path: string) { return this.request<T>(path, { method: 'DELETE' }) }

  /**
   * GET a list route and surface the pagination totals that `request()` throws away.
   *
   * WooCommerce/WordPress never put totals in the body — they are returned as the
   * `X-WP-Total` and `X-WP-TotalPages` response headers, and WordPress adds both to
   * `Access-Control-Expose-Headers` so they are readable cross-origin.
   * Docs: https://developer.wordpress.org/rest-api/using-the-rest-api/pagination/
   *
   * Routes that are not paginated at all (/payment_gateways, /data/countries, ...) send
   * no headers; those fall back to the returned array length / a single page rather than
   * to a fabricated total.
   */
  protected async getPaged<T = any>(path: string, base: string = API_BASE, _retried = false): Promise<{ data: T[]; total: number; totalPages: number }> {
    let res: Response
    try {
      res = await this._fetch(this.url(path, base), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...this.authHeaders() }
      })
    } catch { throw { message: 'Unable to reach the server. Please try again in a moment.' } }
    // Same 401 -> refreshCredentials() -> retry-once contract as request(). Checked before the
    // body is read, so the retry is not handed an already-consumed stream.
    if (res.status === 401 && !_retried && (await this.refreshCredentials())) return this.getPaged<T>(path, base, true)
    const body = await this.safeJson(res)
    if (!res.ok) throw this.toError(body, `Request failed with status ${res.status}`)
    const data: T[] = Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : []
    const totalHeader = Number(res.headers.get('X-WP-Total'))
    const pagesHeader = Number(res.headers.get('X-WP-TotalPages'))
    return {
      data,
      total: Number.isFinite(totalHeader) && totalHeader > 0 ? totalHeader : data.length,
      totalPages: Number.isFinite(pagesHeader) && pagesHeader > 0 ? pagesHeader : 1
    }
  }

  /** Same verbs, against the WooCommerce Store API namespace (cart, checkout, public catalogue). */
  protected storeGet<T = any>(path: string) { return this.request<T>(path, { method: 'GET' }, false, STORE_API_BASE) }
  protected storePost<T = any>(path: string, data?: unknown) { return this.request<T>(path, { method: 'POST', body: data === undefined ? undefined : JSON.stringify(data) }, false, STORE_API_BASE) }
  protected storeDelete<T = any>(path: string) { return this.request<T>(path, { method: 'DELETE' }, false, STORE_API_BASE) }

  /** Same verbs, against the WordPress core namespace (pages, posts, media). */
  protected wpGet<T = any>(path: string) { return this.request<T>(path, { method: 'GET' }, false, WP_API_BASE) }

  /** Overridable: re-issue short-lived credentials for vendors that need it. */
  protected async refreshCredentials(): Promise<boolean> { return false }

  private async safeJson(res: Response): Promise<any> { try { return await res.json() } catch { return {} } }
  protected toError(body: any, fallback: string): { message: string; [k: string]: any } {
    if (body && typeof body === 'object') {
      const message = body.message || body.error || (Array.isArray(body.errors) ? body.errors.map((e: any) => e?.message || e).filter(Boolean).join('; ') : '') || fallback
      return { ...body, message: String(message) }
    }
    return { message: typeof body === 'string' && body ? body : fallback }
  }
  protected dummy<T>(value: T): Promise<T> { return Promise.resolve(value) }
  protected emptyPage<T = any>() { return this.dummy({ data: [] as T[], count: 0, pageSize: 0, noOfPage: 0, page: 1 }) }
  protected setCookie(name: string, value: string, days = 30): void {
    if (typeof document === 'undefined') return
    const expires = new Date(Date.now() + days * 864e5).toUTCString()
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`
  }
}
