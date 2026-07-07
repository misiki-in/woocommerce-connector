import type { ConnectorConfig } from '../config'

export const API_BASE = '/wp-json/wc/v3'

/** NotSupported error thrown when a resource has no WooCommerce API equivalent. */
export class NotSupportedError extends Error {
  code = 'NOT_SUPPORTED' as const
  constructor(feature: string) {
    super(`${feature} is not supported by the WooCommerce connector`)
    this.name = 'NotSupportedError'
  }
}

export class BaseService {
  protected config: ConnectorConfig
  private _fetch: typeof fetch

  constructor(config: ConnectorConfig) {
    this.config = config
    this._fetch = config.fetchFn || fetch
  }

  protected unsupported(feature: string): never {
    throw new NotSupportedError(feature)
  }

  protected authHeaders(): Record<string, string> {
    const token = btoa(`${this.config.apiKey ?? ''}:${this.config.apiSecret ?? ''}`)
    return { Authorization: `Basic ${token}` }
  }

  protected url(path: string): string {
    const u = new URL(this.config.baseUrl.replace(/\/$/, '') + API_BASE + path)
    return u.toString()
  }

  /** Paginated list against `path` using the WooCommerce query convention. */
  protected listAt(path: string, { page = 1, perPage = 20, search = '' }: { page?: number; perPage?: number; search?: string } = {}): Promise<unknown> {
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('per_page', String(perPage))
    if (search) params.set('search', search)
    return this.get(`${path}?${params.toString()}`)
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json', Accept: 'application/json',
      ...this.authHeaders(), ...(init.headers as Record<string, string> | undefined),
    }
    let response: Response
    try {
      response = await this._fetch(this.url(path), { ...init, headers })
    } catch {
      throw { message: 'Unable to reach the WooCommerce server. Please try again in a moment.' }
    }
    if (!response.ok) {
      const ct = response.headers.get('Content-Type') || ''
      const body = ct.includes('json') ? await response.json().catch(() => ({})) : await response.text()
      throw { message: `WooCommerce API error ${response.status} ${response.statusText}`, status: response.status, body }
    }
    if (response.status === 204) return undefined as T
    return (await response.json()) as T
  }

  get<T = unknown>(path: string): Promise<T> { return this.request<T>(path, { method: 'GET' }) }
  post<T = unknown>(path: string, data?: unknown): Promise<T> { return this.request<T>(path, { method: 'POST', body: data === undefined ? undefined : JSON.stringify(data) }) }
  put<T = unknown>(path: string, data?: unknown): Promise<T> { return this.request<T>(path, { method: 'PUT', body: data === undefined ? undefined : JSON.stringify(data) }) }
  patch<T = unknown>(path: string, data?: unknown): Promise<T> { return this.request<T>(path, { method: 'PATCH', body: data === undefined ? undefined : JSON.stringify(data) }) }
  delete<T = unknown>(path: string): Promise<T> { return this.request<T>(path, { method: 'DELETE' }) }
}
