/**
 * Response types — mirrored from @misiki/litekart-connector so kitcommerce-core
 * receives exactly the shapes it expects. Vendor payloads are mapped into these.
 */

export type PaginatedResponse<T> = {
  data: T[]
  count: number
  pageSize: number
  noOfPage: number
  page: number
}

export enum ProductStatus {
  DRAFT = 'draft',
  PROPOSED = 'proposed',
  PUBLISHED = 'published',
  REJECTED = 'rejected'
}

export type Variant = {
  id: string
  productId: string
  title: string
  sku: string | null
  price: number
  mrp: number
  stock: number
  options?: { id: string; value: string }[]
}

export type Product = {
  id: string
  active: boolean
  status: ProductStatus
  type: string
  vendorId: string
  categoryId: string | null
  currency: string | null
  instructions: string | null
  description: string | null
  hsnCode: string | null
  images: string | null
  featuredImage: string | null
  thumbnail: string | null
  keywords: string | null
  link: string | null
  metaTitle: string | null
  metaDescription: string | null
  title: string
  subtitle: string | null
  popularity: number
  rank: number
  slug: string | null
  expiryDate: string | null
  weight: number | null
  mfgDate: string | null
  mrp: number
  price: number
  costPerItem: number
  sku: string | null
  stock: number
  allowBackorder: boolean
  manageInventory: boolean
  shippingWeight: number | null
  shippingHeight: number | null
  shippingLen: number | null
  shippingWidth: number | null
  height: number | null
  width: number | null
  len: number | null
  barcode: string | null
  shippingCost: number | null
  returnAllowed: boolean
  replaceAllowed: boolean
  originCountry: string | null
  weightUnit: string
  dimensionUnit: string
  metadata: Record<string, unknown> | null
  collectionId: string | null
  options?: { id: string; title: string; type: string; values: { id: string; value: string }[] }[]
  variants?: Variant[]
}

export type CartLineItem = {
  id: string
  productId: string
  variantId: string
  qty: number
  price: number
  total: number
}

export type Cart = {
  id: string
  email: string | null
  phone: string | null
  lineItems: CartLineItem[]
  billingAddressId: string | null
  shippingAddressId: string | null
  regionId: string | null
  userId: string | null
  salesChannelId: string | null
  storeId: string | null
  couponCode: string | null
  discountAmount: number
  couponAppliedDate: string | null
  paymentId: string | null
  paymentMethod: string | null
  paymentAuthorizedAt: string | null
  needAddress: boolean
  isCodAvailable: boolean
  type: string
  completedAt: string | null
  idempotencyKey: string | null
  shippingCharges: number
  shippingMethod: string | null
  qty: number
  subtotal: number
  codCharges: number
  tax: number
  total: number
  savingAmount: number
}

export type User = {
  id: string
  phone?: string | null
  email: string
  status?: string | null
  avatar?: string | null
  cartId?: string | null
  firstName?: string | null
  lastName?: string | null
  isApproved: boolean
  isDeleted: boolean
  isEmailVerified: boolean
  isPhoneVerified: boolean
  role?: string | null
  signInCount: number
  otpAttempt: number
  userAuthToken?: string | null
  createdAt: string
  updatedAt: string
}

export type Category = {
  id: string
  title: string
  slug: string | null
  parentId: string | null
  description: string | null
  image: string | null
}

export type Order = {
  id: string
  status: string
  total: number
  subtotal: number
  tax: number
  currency: string | null
  createdAt: string
  lineItems: CartLineItem[]
}

export type verifyEmail = { email: string; token: string }
