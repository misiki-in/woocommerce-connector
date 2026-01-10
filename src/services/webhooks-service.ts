import { BaseService } from './base-service'

export interface Webhook {
  id: number
  topic: string
  name: string
  delivery_url: string
  secret: string
  status: 'active' | 'paused' | 'disabled'
  date_created: string
  date_created_gmt: string
  date_modified: string
  date_modified_gmt: string
}

export interface WebhookBatch {
  create: Webhook[]
  update: Webhook[]
  delete: number[]
}

export interface WebhookListParams {
  context?: 'view' | 'edit'
  page?: number
  per_page?: number
  offset?: number
  order?: 'asc' | 'desc'
  orderby?: 'id' | 'name' | 'date_created' | 'date_modified' | 'topic' | 'status'
  status?: string
}

type WebhookResponse = Webhook
type WebhookListResponse = Webhook[]
type WebhookCreateResponse = Webhook
type WebhookUpdateResponse = Webhook
type WebhookDeleteResponse = { id: number; deleted: boolean }

export class WebhooksService extends BaseService {
  private static instance: WebhooksService

  static getInstance(): WebhooksService {
    if (!WebhooksService.instance) {
      WebhooksService.instance = new WebhooksService()
    }
    return WebhooksService.instance
  }

  /**
   * List all webhooks
   * @param params Query parameters for filtering
   * @returns List of webhooks
   */
  async list(params?: WebhookListParams) {
    try {
      const webhooks = await this.get<WebhookListResponse>('/webhooks', params)
      return webhooks
    } catch (error) {
      console.error('Error fetching webhooks:', error)
      throw error
    }
  }

  /**
   * Get a single webhook
   * @param id Webhook ID
   * @param context Context (view or edit)
   * @returns Webhook details
   */
  async get(id: number, context?: 'view' | 'edit') {
    try {
      const webhook = await this.get<WebhookResponse>(`/webhooks/${id}`, context ? { context } : undefined)
      return webhook
    } catch (error) {
      console.error(`Error fetching webhook ${id}:`, error)
      throw error
    }
  }

  /**
   * Create a new webhook
   * @param data Webhook data
   * @returns Created webhook
   */
  async create(data: Partial<Webhook>) {
    try {
      const webhook = await this.post<WebhookCreateResponse>('/webhooks', data)
      return webhook
    } catch (error) {
      console.error('Error creating webhook:', error)
      throw error
    }
  }

  /**
   * Update a webhook
   * @param id Webhook ID
   * @param data Webhook data to update
   * @returns Updated webhook
   */
  async update(id: number, data: Partial<Webhook>) {
    try {
      const webhook = await this.put<WebhookUpdateResponse>(`/webhooks/${id}`, data)
      return webhook
    } catch (error) {
      console.error(`Error updating webhook ${id}:`, error)
      throw error
    }
  }

  /**
   * Delete a webhook
   * @param id Webhook ID
   * @param force Force delete (not applicable for webhooks, always true)
   * @returns Deleted webhook ID
   */
  async delete(id: number, force?: boolean) {
    try {
      const result = await this.delete_<WebhookDeleteResponse>(`/webhooks/${id}`, force ? { force: true } : undefined)
      return result
    } catch (error) {
      console.error(`Error deleting webhook ${id}:`, error)
      throw error
    }
  }

  /**
   * Batch create, update, and delete webhooks
   * @param data Batch operations
   * @returns Created, updated, and deleted webhooks
   */
  async batch(data: WebhookBatch) {
    try {
      const result = await this.post<{
        create: Webhook[]
        update: Webhook[]
        delete: WebhookDeleteResponse[]
      }>('/webhooks/batch', data)
      return result
    } catch (error) {
      console.error('Error batch processing webhooks:', error)
      throw error
    }
  }
}

export const webhooksService = WebhooksService.getInstance()
