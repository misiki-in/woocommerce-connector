export interface ConnectorConfig {
  baseUrl: string
  apiKey?: string
  apiSecret?: string
  accessToken?: string
  accessKey?: string
  fetchFn?: typeof fetch
}
