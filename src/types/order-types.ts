export type Order = {
<<<<<<< HEAD
	id: string // Unique identifier for the order
	orderNo: number // Unique serial order number
	storeId: string | null // Identifier for the store associated with the order
	batchNo: string | null // Batch number for the order
	amount: Record<string, any> | null // JSON object representing the amount breakdown
	parentOrderNo: string | null // Parent order number, if applicable
	vendorId: string // Identifier for the vendor, references Vendor.id
	isEmailSentToVendor: boolean // Flag to check if an email was sent to the vendor
	status: string // Status of the order (e.g., created, processing, completed)
	cartId: string // Cart ID associated with the order, references Cart.id
	userId: string | null // User ID who placed the order
	userPhone: string | null // User phone number
	userFirstName: string | null // First name of the user
	userLastName: string | null // Last name of the user
	userEmail: string | null // User email address
	comment: string | null // Any comment provided with the order
	needAddress: boolean // Flag indicating if an address is needed for the order
	selfTakeout: boolean // Flag for self-takeout orders
	shippingCharges: number // Charges for shipping
	total: number | null // Total amount for the order
	subtotal: number | null // Subtotal amount for the order
	discount: number | null // Discount applied to the order
	tax: number | null // Tax amount for the order
	currencySymbol: string | null // Symbol for the currency used
	currencyCode: string | null // Currency code (e.g., USD, EUR)
	codCharges: number | null // Cash on Delivery charges, if applicable
	codPaid: number | null // Amount paid for COD
	paid: boolean // Flag indicating if the order is fully paid
	paySuccess: number // Payment success flag or count
	amountRefunded: number | null // Total amount refunded
	amountDue: number | null // Remaining amount due
	amountPaid: number | null // Total amount paid so far
	totalDiscount: number | null // Total discount on the order
	totalAmountRefunded: number | null // Total refunded amount on the order
	paymentMethod: string | null // Payment method used
	platform: string | null // Platform through which the order was placed
	couponUsed: string | null // Coupon code used
	coupon: string | null // Coupon details
	paymentStatus: string | null // Status of the payment
	paymentCurrency: string | null // Currency in which the payment was made
	paymentMsg: string | null // Payment status message
	paymentReferenceId: string | null // Reference ID for payment processing
	paymentGateway: string | null // Payment gateway used
	paymentId: string | null // Payment ID, references Payment.id
	paymentAmount: number | null // Amount paid through the payment method
	paymentMode: string | null // Mode of payment (e.g., card, UPI)
	paymentDate: string | null // Date of the payment
	shippingAddressId: string | null // Shipping address ID
	billingAddressId: string | null // Billing address ID
	shippingAddress: Record<string, any> | null // JSON object for shipping address details
	billingAddress: Record<string, any> | null // JSON object for billing address details
	lineItems: OrderItem[] // Array of order items
	createdAt: string // Timestamp when order was created
	updatedAt: string // Timestamp when order was last updated
}

export type Return = {
	id: string // Unique identifier for the return
	orderId: string // Identifier for the associated order
	reason: string // Reason for the return
	status: string // Current status of the return (e.g., pending, approved, rejected)
	createdBy: string // Identifier for the user who initiated the return
	createdAt: string // Timestamp for when the return was created
	updatedAt: string // Timestamp for when the return was last updated
}

export type ReturnReason = {
	id: string
	name: string
}

export type Coupon = {
	id: string // Unique identifier for the coupon
	code: string // Unique code for the coupon
	amount: number // Discount amount
	type: 'USER' | 'TOTAL' | 'BOGO' // Type of coupon, as defined by the CouponTypeEnum
	maxAmount: number // Maximum discount amount
	createdAt: string // Timestamp of when the coupon was created
	updatedAt: string // Timestamp of the last update to the coupon
}

export type Deal = {
	// Primary fields
	id: string
	title: string
	description: string | null
	storeId: string | null

	// Deal configuration and conditions
	dealType: string // e.g., "discount", "bundle", "BOGO"
	discountPercentage: number | null
	discountAmount: number | null
	minPurchaseAmount: number | null
	startDate: string
	endDate: string | null
	active: boolean
	conditions: Record<string, any> | null // e.g., specific category, user segment, etc.

	// Product associations
	products: string[] // Array of product IDs eligible for the deal
	variants: string[] // Array of variant IDs eligible for the deal

	// Deal limits
	maxUses: number | null // Maximum times the deal can be applied
	perUserLimit: number | null // Maximum times a single user can use this deal

	// Metadata and tracking
	metadata: Record<string, any> | null
	createdAt: string
	updatedAt: string
}

export type Invoice = {
	id: string
	name: string
}

export type ShippingProvider = {
	id: string
	name: string
}

export type Fulfillment = {
	id: string // Primary key for the fulfillment record
	shippingSync: boolean // Indicates if shipping is synchronized
	store: string | null // Optional store identifier
	active: boolean // Indicates if the fulfillment is active
	orderNo: number // Order number associated with the fulfillment
	trackingNumber: string | null // Optional tracking number for the shipment
	trackingUrl: string | null // Optional URL for tracking the shipment
	vendorId: string | null // Optional vendor ID for the fulfillment
	orderId: string | null // Optional order ID for the fulfillment
	batchNo: string // Batch number for the fulfillment (required)
	fulfillmentOrderId: string | null // Optional fulfillment order ID
	shipmentId: string | null // Optional shipment ID
	shippingProvider: string | null // Optional shipping provider name
	shipmentLabel: string | null // Optional label for the shipment
	invoiceUrl: string | null // Optional URL for the invoice
	courierName: string | null // Optional name of the courier
	courierId: string | null // Optional ID of the courier
	shippingStatus: string | null // Optional shipping status
	status: string // Current status of the fulfillment (default: 'confirmed')
	shippingInfo: string | null // Optional additional shipping information
	manifest: string | null // Optional manifest details
	userId: number | null // Optional user ID associated with the fulfillment
	pickup: Record<string, any> | null // Optional JSON object for pickup details
	weight: number | null // Weight in grams
	length: number | null // Length dimension
	breadth: number | null // Breadth dimension
	height: number | null // Height dimension
	createdAt: string // Timestamp for when the fulfillment was created
	updatedAt: string // Timestamp for when the fulfillment was last updated
}

export type PaymentMethod = {
	id: string // Unique identifier for the payment method
	name: string // Name of the payment method (must be unique)
	type: string // Type of payment method (e.g., credit card, PayPal)
	active: boolean // Indicates if the payment method is active
	isTest: boolean // Indicates if the payment method is in test mode
	manualCapture: boolean // Indicates if the payment method requires manual capture
	value: string
	createdAt: string // Timestamp for when the payment method was created
	updatedAt: string // Timestamp for when the payment method was last updated
}

// Order specific lightweight interface
export interface OrderItem {
	id: string
	productId: string
	variantId?: string
	title: string
	price: number
	quantity: number
	thumbnail?: string
	total?: string
	sku?: string
	description?: string
	images?: string[]
	variant?: {
		id: string
		title: string
		price: number
		sku?: string
	}
=======
  id: string
  orderNo: string
  parentOrderNo?: string
  createdAt: string
  updatedAt: string
  status: string
  lineItems: Array<{
    id: string
    productId: string
    variantId: string
    qty: number
    price: number
    total: number
    title: string
    sku: string
    thumbnail?: string
  }>
  userId?: string
  userEmail: string
  userPhone: string
  userFirstName?: string
  userLastName?: string
  shippingAddress: any
  billingAddress: any
  subtotal: number
  total: number
  discount: number
  shipping: number
  tax: number
  paymentMethod: string
  paymentStatus: string
  currencyCode?: string
  currencySymbol?: string
  paid?: boolean
>>>>>>> f348a1b (feat: product listing)
}
