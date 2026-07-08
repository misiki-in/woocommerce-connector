/**
 * Credentials for this connector. Injected once via BaseService.setCredentials()
 * from the SvelteKit client + server hooks (never through constructors, since the
 * client imports prebuilt singletons). At least one of apiUrl / storeId /
 * channelId is always used.
 */
export interface Credentials {
  /** Vendor API base URL (store URL / API root). */
  apiUrl: string
  apiKey?: string
  apiSecret?: string
  accessToken?: string
  accessKey?: string
  storeId?: string
  channelId?: string
  refreshToken?: string
}
