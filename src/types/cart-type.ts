export type Cart = {
	// Primary fields
	id: string
	email: string | null
	phone: string | null
	lineItems: CartLineItem[]
	// References
	billingAddressId: string | null
	shippingAddressId: string | null
	regionId: string | null
	userId: string | null
	salesChannelId: string | null
	storeId: string | null

	// Payment and discount related
	couponCode: string | null
	discountAmount: number
	couponAppliedDate: string | null
	paymentId: string | null
	paymentMethod: string | null
	paymentAuthorizedAt: string | null

	// Cart configuration
	needAddress: boolean
	isCodAvailable: boolean
	type: string
	completedAt: string | null
	idempotencyKey: string | null

	// Shipping related
	shippingCharges: number
	shippingMethod: string | null

	// Quantity and monetary values
	qty: number
	subtotal: number
	codCharges: number
	tax: number
	total: number
	savingAmount: number

  items: CartProduct[]
}

export type CartLineItem = {
	id: string
	productId: string
	variantId: string
	qty: number
	price: number
	total: number
}

export type CartProduct = {
	id: string
	slug: string
	thumbnail: string
	productId: string
	variantId: string
	item_id: string
	title: string
	price: number
	product: any // This should reference Product type
	qty: number
}

export type Checkout = {
	id: string // Unique identifier for the checkout
	orderId: string // Identifier for the associated order
	userId: string // ID of the user making the checkout
	status: string // Status of the checkout (e.g., pending, completed)
	totalAmount: number // Total amount for the checkout
	paymentMethod: string // Payment method used in the checkout
	paymentStatus: string // Status of payment (e.g., unpaid, paid)
	isConfirmed: boolean // Indicates if the checkout is confirmed
	discount: number // Discount applied to the total amount
	tax: number // Tax applied to the total amount
	shippingCost: number // Shipping cost for the checkout
	createdAt: string // Timestamp of when the checkout was created
	updatedAt: string // Timestamp of the last update to the checkout
}
