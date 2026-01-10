import { BaseService } from './base-service'

export interface SystemStatusInfo {
  environment: {
    home_url: string
    site_url: string
    wc_version: string
    wc_active: boolean
    wordpress_version: string
    wordpress_multisite: boolean
    file_uploads: boolean
    memory_limit: string
    memory_usage: string
    max_memory_limit: string
    wp_debug: boolean
    wp_debug_display: boolean
    wp_script_debug: boolean
    gzip: boolean
    loops: string
    show_errors: boolean
    cron: boolean
    cron_last: number
    authentication_keys_salt: string
    disable_author_and_author_archives: boolean
    }
  database: {
    wc_database_version: string
    wc_database_version_raw: number
    database_size: string
    database_size_human: string
    database_size_human_readable: string
    maxmind_geoip_database: string
    database_tables: {
      [key: string]: {
        data_length: string
        index_length: string
        data_free: string
        engine: string
      }
    }
    database_collation: string
    database_charset: string
    database_name: string
  }
  post_type_counts: {
    [key: string]: number
  }
  theme: {
    name: string
    version: string
    version_latest: string
    author: string
    author_url: string
    is_child_theme: boolean
    has_woocommerce_support: boolean
    has_woocommerce_templates: boolean
    overlay_background: string
    overlay_text_color: string
    overlay_button_text_color: string
    overlay_button_background: string
    sorting: string
    sort: string
    homepageId: number
    shop_pages: {
      shop: number
      cart: number
      checkout: number
      myaccount: number
    }
    theme_status: string
    theme_file_exists: boolean
  }
  settings: {
    api_enabled: boolean
    force_ssl: boolean
    currency: string
    currency_symbol: string
    currency_position: string
    thousand_separator: string
    decimal_separator: string
    number_of_decimals: number
    tax_nonzero: string
    tax_display_cart: string
    price_display_suffix: string
    tax_round_at_subtotal: string
    tax_display_shop: string
    tax_based_on: string
    shipping_tax_classes: string
    tax_default_location: string
    upcoming_sales: string
    emails: string
    split_tax_lines: string
    tax_lines: string[]
    enable_ajax_add_to_cart: string
    quote_reply_prefix: string
    hosted_demo: string
  }
  security: {
    secure_connection: boolean
    hide_errors: boolean
  }
  pages: {
    [key: string]: {
      id: number
      post_title: string
      post_id: number
      set_page: string
      page_exists: boolean
      page_status: string
    }
  }
  plugins: {
    active_plugins: string[]
    inactive_plugins: string[]
    dropins: string[]
    mu_plugins: string[]
  }
  admin: {
    enable_health_check: boolean
    timestamp: number
    continents: boolean
  }
}

export interface SystemStatusReport {
  name: string
  label: string
  description: string
  type: string
  fields: {
    [key: string]: {
      label: string
      value: string
      status: 'good' | 'warning' | 'critical'
      action: string
      action_label: string
    }
  }
}

type SystemStatusResponse = SystemStatusInfo
type SystemStatusReportResponse = SystemStatusReport[]

export class SystemStatusService extends BaseService {
  private static instance: SystemStatusService

  static getInstance(): SystemStatusService {
    if (!SystemStatusService.instance) {
      SystemStatusService.instance = new SystemStatusService()
    }
    return SystemStatusService.instance
  }

  /**
   * Get system status information
   * @returns System status information
   */
  async get() {
    try {
      const status = await this.get<SystemStatusResponse>('/system_status')
      return status
    } catch (error) {
      console.error('Error fetching system status:', error)
      throw error
    }
  }

  /**
   * Get system status report
   * @returns System status report with health checks
   */
  async getReport() {
    try {
      const report = await this.get<SystemStatusReportResponse>('/system_status/reports')
      return report
    } catch (error) {
      console.error('Error fetching system status report:', error)
      throw error
    }
  }
}

export const systemStatusService = SystemStatusService.getInstance()
