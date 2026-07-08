import type { Credentials } from '../config'

/**
 * BaseService — shared REST client for the WooCommerce connector.
 * - Credentials via static setCredentials (client + server hooks), not constructors.
 * - Server-side: constructed with a custom fetch (cookies). Client-side: singletons.
 * - Unsuccessful responses THROW the parsed body (always carrying `message`).
 * - refreshCredentials() is an overridable hook for vendors with short-lived tokens.
 */
export const API_BASE = '/wp-json/wc/v3'

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

  protected url(path: string): string {
    const root = (this.creds.apiUrl || '').replace(/\/$/, '') + API_BASE
    return root + path
  }

  protected async request<T = any>(path: string, init: RequestInit = {}, _retried = false): Promise<T> {
    let res: Response
    try {
      res = await this._fetch(this.url(path), {
        ...init,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...this.authHeaders(), ...(init.headers as any) }
      })
    } catch { throw { message: 'Unable to reach the server. Please try again in a moment.' } }
    if (res.status === 401 && !_retried && (await this.refreshCredentials())) return this.request<T>(path, init, true)
    if (!res.ok) throw this.toError(await this.safeJson(res), `Request failed with status ${res.status}`)
    if (res.status === 204) return undefined as T
    return (await this.safeJson(res)) as T
  }
  get<T = any>(path: string) { return this.request<T>(path, { method: 'GET' }) }
  post<T = any>(path: string, data?: unknown) { return this.request<T>(path, { method: 'POST', body: data === undefined ? undefined : JSON.stringify(data) }) }
  put<T = any>(path: string, data?: unknown) { return this.request<T>(path, { method: 'PUT', body: data === undefined ? undefined : JSON.stringify(data) }) }
  patch<T = any>(path: string, data?: unknown) { return this.request<T>(path, { method: 'PATCH', body: data === undefined ? undefined : JSON.stringify(data) }) }
  delete<T = any>(path: string) { return this.request<T>(path, { method: 'DELETE' }) }

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
