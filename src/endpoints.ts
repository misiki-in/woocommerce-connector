/** Endpoint map for WooCommerce (relative to API base `/wp-json/wc/v3`). undefined => unsupported. */
export interface Endpoints {
  products?: string; categories?: string; collections?: string; orders?: string; coupons?: string
  customers?: string; addresses?: string; reviews?: string; wishlist?: string; cart?: string
  countries?: string; states?: string; currencies?: string; pages?: string; blog?: string
  settings?: string; paymentMethods?: string; vendors?: string; search?: string
}

export const EP: Endpoints = {
  products: "/products",
  categories: "/products/categories",
  collections: undefined,
  orders: "/orders",
  coupons: "/coupons",
  customers: "/customers",
  addresses: undefined,
  reviews: "/products/reviews",
  wishlist: undefined,
  cart: undefined,
  countries: "/data/countries",
  states: undefined,
  currencies: "/data/currencies",
  pages: undefined,
  blog: undefined,
  settings: "/settings",
  paymentMethods: "/payment_gateways",
  vendors: undefined,
  search: "/products",
}
