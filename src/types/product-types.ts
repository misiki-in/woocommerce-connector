<<<<<<< HEAD
// WooCommerce Product Types

export type ProductDownload = {
	id: string
	name: string
	file: string
}

export type ProductDimensions = {
	length: string
	width: string
	height: string
}

export type ProductCategory = {
	id: number
	name: string
	slug: string
}

export type ProductTag = {
	id: number
	name: string
	slug: string
}

export type ProductImage = {
	id: number
	date_created: string
	date_created_gmt: string
	date_modified: string
	date_modified_gmt: string
	src: string
	name: string
	alt: string
}

export type ProductAttribute = {
	id: number
	name: string
	position: number
	visible: boolean
	variation: boolean
	options: string[]
}

export type ProductDefaultAttribute = {
	id: number
	name: string
	option: string
}

export type ProductMetaData = {
	id: number
	key: string
	value: any
}

export type Product = {
	id: number
	name: string
	slug: string
	permalink: string
	date_created: string
	date_created_gmt: string
	date_modified: string
	date_modified_gmt: string
	type: 'simple' | 'grouped' | 'external' | 'variable'
	status: 'draft' | 'pending' | 'private' | 'publish'
	featured: boolean
	catalog_visibility: 'visible' | 'catalog' | 'search' | 'hidden'
	description: string
	short_description: string
	sku: string
	price: string
	regular_price: string
	sale_price: string
	date_on_sale_from: string | null
	date_on_sale_from_gmt: string | null
	date_on_sale_to: string | null
	date_on_sale_to_gmt: string | null
	price_html: string
	on_sale: boolean
	purchasable: boolean
	total_sales: number
	virtual: boolean
	downloadable: boolean
	downloads: ProductDownload[]
	download_limit: number
	download_expiry: number
	external_url: string
	button_text: string
	tax_status: 'taxable' | 'shipping' | 'none'
	tax_class: string
	manage_stock: boolean
	stock_quantity: number | null
	stock_status: 'instock' | 'outofstock' | 'onbackorder'
	backorders: 'no' | 'notify' | 'yes'
	backorders_allowed: boolean
	sold_individually: boolean
	weight: string
	dimensions: ProductDimensions
	shipping_required: boolean
	shipping_taxable: boolean
	shipping_class: string
	shipping_class_id: number
	reviews_allowed: boolean
	average_rating: string
	rating_count: number
	related_ids: number[]
	upsell_ids: number[]
	cross_sell_ids: number[]
	parent_id: number
	purchase_note: string
	categories: ProductCategory[]
	tags: ProductTag[]
	images: ProductImage[]
	attributes: ProductAttribute[]
	default_attributes: ProductDefaultAttribute[]
	variations: number[]
	grouped_products: number[]
	menu_order: number
	meta_data: ProductMetaData[]
}

// Enums
export enum ProductStatus {
	DRAFT = 'draft',
	PROPOSED = 'proposed',
	PUBLISHED = 'published',
	REJECTED = 'rejected'
}

export type Variant = {
  id: string;
  title: string;
  productId: string;
  sku: string | null;
  barcode: string | null;
  batchNo: string | null;
  stock: number;
  allowBackorder: boolean;
  manageInventory: boolean;
  hsCode: string | null;
  originCountry: string | null;
  calculated_price: {
    id: string;
    is_calculated_price_price_list: boolean;
    is_calculated_price_tax_inclusive: boolean;
    calculated_amount: number;
    calculated_amount_with_tax: number;
    calculated_amount_without_tax: number;
    is_original_price_price_list: boolean;
    is_original_price_tax_inclusive: boolean;
    original_amount: number;
    currency_code: string;
    calculated_price: Record<string, unknown>;
    original_price: Record<string, unknown>;
    original_amount_with_tax: number;
    original_amount_without_tax: number;
  };
  midCode: string | null;
  material: string | null;
  weight: number | null;
  length: number | null;
  height: number | null;
  width: number | null;
  price: number;
  costPerItem: number;
  mfgDate: string | null;
  expiryDate: string | null;
  returnAllowed: boolean;
  replaceAllowed: boolean;
  mrp: number;
  img: string | null;
  description: string | null;
  storeId: string | null;
  len: number | null;
  rank: number;
  shippingWeight: number | null;
  shippingHeight: number | null;
  shippingLen: number | null;
  shippingWidth: number | null;
  shippingCost: number | null;
  metadata: Record<string, unknown> | null;
  variantRank: number;
  options: { id: string; optionId: string; value: string; variantId: string }[];
};

export type CategoryImage = {
	id: number
	date_created: string
	date_created_gmt: string
	date_modified: string
	date_modified_gmt: string
	src: string
	name: string
	alt: string
}

export type Category = {
	id: number // Unique identifier for the category
	name: string // Name of the category
	slug: string // URL-friendly name
	parent: number // Parent category ID, 0 for no parent
	description: string // Description of the category
	display: 'default' | 'products' | 'subcategories' | 'both' // Category display type
	image: CategoryImage | null // Category image data
	menu_order: number // Menu order for sorting
	count: number // Number of products in the category
=======
export enum ProductStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published'
}

export type Product = {
  id: string
  handle: string
  active: boolean
  status: ProductStatus
  title: string
  description: string | null
  thumbnail: string | null
  slug: string | null
  price: number
  mrp: number
  images: string // Comma-separated URLs or handled specifically by transformer
  variants: Variant[]
  options: any[]
  tags: string[]
  // ... other fields can be added as needed to match the platform
}

export type Variant = {
  id: string
  productId: string
  title: string
  sku: string | null
  price: number
  mrp: number
  stock_quantity: number
  stock_status: 'instock' | 'outofstock'
  options: any[]
}

export type Category = {
	id: string // Unique identifier for the category
	isActive: boolean // Indicates if the category is active
	isInternal: boolean // Indicates if the category is internal
	isMegamenu: boolean // Indicates if the category is part of a megamenu
	thumbnail: string | null // Optional thumbnail image URL
	path: string | null // Optional URL path for the category
	level: number | null // Optional level in the category hierarchy
	description: string | null // Optional description of the category
	isFeatured: boolean // Indicates if the category is featured
	keywords: string | null // Optional keywords for SEO
	rank: number // Rank for sorting, defaulting to 0
	link: string | null // Optional link associated with the category
	metaDescription: string | null // Optional meta description for SEO
	metaKeywords: string | null // Optional meta keywords for SEO
	metaTitle: string | null // Optional meta title for SEO
	name: string // Name of the category
	parentCategoryId: string | null // Optional reference to the parent category
	store: string | null // Optional store associated with the category
	slug: string | null // Optional URL-friendly name
	userId: string // User ID of the creator or owner
	activeProducts: number // Count of active products, defaults to 0
	inactiveProducts: number // Count of inactive products, defaults to 0
	createdAt: string // Timestamp of creation
	updatedAt: string // Timestamp of last update
>>>>>>> f348a1b (feat: product listing)
}

export type Collection = {
	id: string // Unique identifier for the collection
	name: string // Name of the collection
	slug: string // URL-friendly slug for the collection
	description: string | null // Optional description of the collection
	isActive: boolean // Indicates if the collection is active
	isFeatured: boolean // Indicates if the collection is featured
	userId: string // User ID of the creator or owner
	productCount: number // Number of products in the collection, defaults to 0
	thumbnail: string | null // Optional thumbnail image URL
	metaTitle: string | null // Optional meta title for SEO
	metaDescription: string | null // Optional meta description for SEO
	createdAt: string // Timestamp of when the collection was created
	updatedAt: string // Timestamp of last update to the collection
}
<<<<<<< HEAD

export type Tag = {
	id: string
	name: string
	description: string
	type: string
	colorCode: string
	slug: string
	userId: string
	rank: number
	createdAt: string
	updatedAt: string
}

export type Review = {
	rating: number
	comment: string
	date: string
	reviewerName: string
	reviewerEmail: string
}

export type Dimensions = {
	width: number
	height: number
	depth: number
}

export type InventoryItem = {
	id: string
	name: string
	description: string | null
	type: string
	productId: string
	location: string
	stock: number
	sku: string
	barcode: string
	batchNo: string
	allowBackorder: boolean
	manageInventory: boolean
	minStockLevel: number
	reorderQuantity: number
	active: boolean
	createdAt: string
	updatedAt: string
}

export type PopularSearch = {
	id: string // Unique identifier for the popular search entry
	searchTerm: string // The search term that is popular
	popularityScore: number // Score indicating how popular the search term is
	createdAt: string // Timestamp for when the popular search entry was created
	updatedAt: string // Timestamp for when the popular search entry was last updated
}

export type AutoComplete = {
	id: string // Unique identifier for the autocomplete entry
	text: string // Text for the autocomplete suggestion
	type: string // Type/category of the suggestion (e.g., "product", "category")
	popularity: number // Popularity score, used for ranking
	createdAt: string // Timestamp of when the entry was created
	updatedAt: string // Timestamp of the last update to the entry
}

// The following interfaces are lightweight versions or additional interfaces
// that may be used in some parts of the application

// Product related additional types
export interface ProductVariant {
	id: string
	title: string
	price: number
	mrp?: number
	thumbnail?: string
	stock?: number
	sku?: string
	options?: VariantOption[]
}

export interface ProductOption {
	id: string
	name: string
	values: OptionValue[]
}

export interface OptionValue {
	value: string
	available?: boolean
	selected?: boolean
}

export interface VariantOption {
	optionId: string
	value: string
}
=======
>>>>>>> f348a1b (feat: product listing)
