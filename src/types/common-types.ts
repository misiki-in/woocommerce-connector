export type Currency = {
	id: string
	name: string
}

export type ApiKey = {
	id: string
	secret: string
	active: boolean
	public: string
	createdAt: Date
	updatedAt: Date
}

export type Init = {
	name: string
}

export type Home = {
	name: string
}

export type State = {
	name: string
	code: string
}

export type Message = {
	id: string
	name: string
}

export type Meta = {
	createdAt: string
	updatedAt: string
	barcode: string
	qrCode: string
}

export type Report = {
	id: string // Unique identifier for the report
	title: string // Title of the report
	description: string // Detailed description of the report
	createdBy: string // Identifier for the user who created the report
	status: string // Current status of the report (e.g., pending, completed, reviewed)
	createdAt: string // Timestamp for when the report was created
	updatedAt: string // Timestamp for when the report was last updated
}

export type Wishlist = {
	id: string // Unique identifier for the wishlist entry
	active: boolean // Status to indicate if the wishlist item is active
	product: string // Product ID associated with the wishlist item
	listing: string // Listing ID for the product
	store: string | null // Store ID, can be null if not specified
	userId: string // User ID who created the wishlist item
	variant: string // Variant ID of the product, defaults to an empty string
	createdAt: string // Timestamp of when the wishlist item was created
	updatedAt: string // Timestamp of the last update to the wishlist item
}

export type PaginatedResponse<T> = {
	data: T[] // Array of items of type T
	count: number // Total count of items in the collection
	pageSize: number // Number of items per page
	noOfPage: number // Total number of pages
	page: number // Current page number
}

export type Upload = {
	url: string
}

// For products or other types that would appear in a structured data format for search engines
export type ProductStructuredData = {
	'@context': string
	'@type': string
	name: string
	description?: string
	image?: string[]
	offers?: {
		'@type': string
		price: number
		priceCurrency: string
		url: string
		availability: string
		seller: {
			'@type': string
			name: string
		}
	}
}
