/**
 * Type definitions for store data
 */

export interface Plugin {
	active?: boolean
	value?: string | boolean | number
	phone?: string
	enableReviews?: boolean
	whatsappChatButton?: {
		active?: boolean
		phone?: string
	}
	[key: string]: unknown
}

export interface B2bSettings {
	allowDifferentBillingAddress?: {
		val?: boolean
	}
	[key: string]: unknown
}

export interface StoreData {
	id: string
	name: string
	domain?: string
	logo?: string
	favicon?: string
	plugins?: Record<string, Plugin>
	b2b?: B2bSettings
	state?: string
	city?: string
	[key: string]: unknown // For other potential properties
}

export interface RequestParams {
	request: Request
	url: URL
}
