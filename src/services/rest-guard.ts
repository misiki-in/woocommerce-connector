/**
 * Storefront REST paths, intercepted.
 *
 * This connector inherits methods that address the storefront's REST API by path — `/api/menu`,
 * `/api/pages/*`, `/api/ms-autocomplete/*`, dozens more. Those paths are relative, so in dev a
 * Vite proxy forwards them to that REST API and in production they hit the storefront's own
 * origin. Behind WooCommerce there is no such API, so the request can only fail.
 *
 * WooCommerce's own paths never reach here: every one of them is relative to this connector's API
 * base (see base.service.ts), so a leading `/api/` only ever marks an inherited storefront path.
 *
 * Reads for a collection resolve empty (a store legitimately has none); reads for one record and
 * every write throw, because a blank detail page reads as broken and a silent success would tell a
 * shopper their review or enquiry was saved when nothing left the browser. Each distinct path is
 * reported once, so gaps surface while developing instead of staying invisible.
 */
const REST_PATH = /^\/api\//

/** Trailing segments that name a list or a singleton rather than a record id. */
const COLLECTION_SEGMENTS = new Set([
  'all',
  'list',
  'list-by-parent',
  'list-public',
  'latest',
  'search',
  'public',
  'public-details',
  'me',
  'multiple'
])

const emptyResult = () => ({ data: [], count: 0, pageSize: 0, noOfPage: 0, page: 1 })

const addressesOneRecord = (url: string) => {
  const segments = url.split('?')[0].split('/').filter(Boolean)
  if (segments.length < 3) return false
  return !COLLECTION_SEGMENTS.has(segments[segments.length - 1].toLowerCase())
}

const reported = new Set<string>()

const report = (method: string, url: string) => {
  const key = `${method} ${url.split('?')[0]}`
  if (reported.has(key)) return
  reported.add(key)
  console.warn(
    `[woocommerce] no native implementation for \`${key}\` — this path belongs to the storefront's REST API and was not called.`
  )
}

/**
 * Answers a REST path from data the storefront holds (menus, countries, currencies,
 * plugin toggles…). Return `undefined` to fall through to the behaviour above.
 */
export type RestResolver = (url: string) => Promise<unknown> | unknown | undefined

let localResolver: RestResolver | undefined

export const serveRestLocally = (resolver: RestResolver) => {
  localResolver = resolver
}

export const resolveRestLocally = async (method: string, url: string) => {
  const local = await localResolver?.(url)
  if (local !== undefined) return local

  report(method, url)
  if (addressesOneRecord(url)) {
    throw new Error(`This item is not available on this store (woocommerce).`)
  }
  return emptyResult()
}

export const isRestPath = (url: unknown): boolean =>
  typeof url === 'string' && REST_PATH.test(url)
