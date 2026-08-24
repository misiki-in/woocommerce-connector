/**
 * Store identity for a WooCommerce storefront.
 *
 * WooCommerce has no notion of the record this storefront calls a "store" — name, logo, favicon,
 * currency, menus, plugin toggles, theme variables. On a REST backend that comes from
 * `/api/stores/public-details`; behind WooCommerce there is no such API, so the storefront supplies
 * it from its own config and registers it once at boot.
 *
 * Until it is registered, the services below behave exactly as before.
 */
export type StaticStoreProvider = () => Promise<Record<string, any>> | Record<string, any>

let provider: StaticStoreProvider | undefined

export const setStaticStore = (fn: StaticStoreProvider) => {
  provider = fn
}

export const hasStaticStore = () => Boolean(provider)

export const readStaticStore = async (): Promise<Record<string, any> | undefined> => {
  if (!provider) return undefined
  return await provider()
}

/** The marker the storefront reads to tell which backend is active. */
export const connectorName = 'woocommerce'
