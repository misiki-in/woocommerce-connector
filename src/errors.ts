/**
 * Thrown by connector methods that have no implementation against this platform yet.
 * Callers can branch on it to fall back, rather than silently receiving empty data.
 */
export class NotSupportedError extends Error {
  readonly service: string
  readonly method: string
  constructor(service: string, method: string, detail?: string) {
    super(`${service}.${method}() is not implemented in this connector${detail ? `: ${detail}` : '.'}`)
    this.name = 'NotSupportedError'
    this.service = service
    this.method = method
  }
}
