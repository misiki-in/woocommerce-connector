import type { Cart, CartLineItem } from "../types";
import { BaseService } from "./base-service";

type WooCommerceCartResponse = {
  id: string
  key: string
  currency: {
    code: string
    symbol: string
  }
  prices_include_tax: boolean
  items: Array<{
    key: string
    id: number
    type: string
    quantity: number
    variation: Array<{
      attribute: string
      value: string
    }>
   _totals: {
      raw: number
      formatted: string
    }
    product: {
      id: number
      name: string
      slug: string
      images: Array<{
        id: number
        src: string
      }>
    }
    totals: {
      line_total: number
      line_total_currency: string
      total: number
      total_currency: string
    }
  }>
  coupons: Array<{
    code: string
    totles: {
      discount: number
      discount_tax: number
    }
  }>
  fees: Array<any>
  itemsWeight: number
  needsPayment: boolean
  needsShipping: boolean
  shipping: {
    packages: Array<{
      package_details: string
      package_items: Array<any>
      package_rate: Array<{
        id: string
        label: string
        cost: number
        method_id: string
      }>
    }>
    showPackageDetails: boolean
    showShippingCalculator: boolean
    shippingClasses: Array<any>
  }
  totals: {
    subtotal: string
    subtotal_tax: string
    shipping_total: string
    shipping_tax: string
    fees_total: string
    fees_tax: string
    discount_total: string
    discount_tax: string
    total: string
    total_tax: string
  }
  errors: Array<any>
}

export function transformIntoLineItem(item: WooCommerceCartResponse['items'][0]): CartLineItem {
  return {
    id: item.key,
    productId: item.product.id.toString(),
    variantId: item.id.toString(),
    sku: '',
    title: item.product.name,
    slug: item.product.slug,
    qty: item.quantity,
    price: item._totals.raw,
    total: item.totals.line_total,
    subtotal: item._totals.raw,
    description: '',
    thumbnail: item.product.images?.[0]?.src || '',
    images: item.product.images?.map(img => img.src) || [],
    isSelectedForCheckout: true,
    variant: {
      id: item.id.toString(),
      title: item.variation?.map(v => `${v.attribute}: ${v.value}`).join(', ') || '',
      price: item._totals.raw,
      sku: ''
    }
  }
}

function transformIntoCart(cart: WooCommerceCartResponse): Cart {
  return {
    id: cart.id,
    key: cart.key,
    currency: cart.currency.code,
    qty: cart.items.reduce((a: number, b: any) => a + b.quantity, 0),
    subtotal: parseFloat(cart.totals.subtotal) || 0,
    tax: parseFloat(cart.totals.total_tax) || 0,
    discount: parseFloat(cart.totals.discount_total) || 0,
    total: parseFloat(cart.totals.total) || 0,
    shippingCharges: parseFloat(cart.totals.shipping_total) || 0,
    lineItems: cart.items.map(transformIntoLineItem),
    coupons: cart.coupons,
    fees: cart.fees,
    needsPayment: cart.needsPayment,
    needsShipping: cart.needsShipping,
    itemsWeight: cart.itemsWeight,
    errors: cart.errors
  }
}

export class CartService extends BaseService {
  private static instance: CartService;

  static getInstance(): CartService {
    if (!CartService.instance) {
      CartService.instance = new CartService();
    }
    return CartService.instance;
  }

  /**
   * Ensure a cart exists and return the cart ID
   * Uses WooCommerce Store API to create/get a cart
   */
  async ensureCartId(cartId: string | null | undefined): Promise<string> {
    if (cartId === undefined || cartId === "undefined" || !cartId) {
      // Try to get cart from localStorage
      cartId = typeof localStorage !== 'undefined' ? localStorage.getItem("cart_id") || null : null;
    }
    
    if (!cartId) {
      // Create a new cart using WooCommerce Store API
      const cartRes = await this.post<{ id: string; key: string }>(
        "/wp-json/wc/store/v1/cart",
        {}
      );
      cartId = cartRes?.id || cartRes?.key;
      
      if (cartId && typeof localStorage !== 'undefined') {
        localStorage.setItem("cart_id", cartId);
      }
    }
    
    if (typeof cartId != "string" || !cartId) {
      throw new Error("Could not ensure cartId");
    }

    return cartId;
  }

  /**
   * Fetch current cart data
   */
  async fetchCartData() {
    const cartId = typeof localStorage !== 'undefined' ? localStorage.getItem("cart_id") || null : null;
    if (!cartId) return null;

    const cart = await this.get<WooCommerceCartResponse>("/wp-json/wc/store/v1/cart");
    
    if (!cart) return null;
    
    return {
      ...transformIntoCart(cart),
      lineItems: cart.items.map((item) => ({
        ...transformIntoLineItem(item),
        title: item.product.title
      }))
    };
  }

  /**
   * Refresh/regenerate the cart
   */
  async refereshCart() {
    const cartRes = await this.post<WooCommerceCartResponse>("/wp-json/wc/store/v1/cart", {});
    const cartId = cartRes?.id || cartRes?.key;
    
    if (cartId && typeof localStorage !== 'undefined') {
      localStorage.setItem('cart_id', cartId);
    }
    
    return transformIntoCart(cartRes);
  }

  /**
   * Get cart by cart ID (WooCommerce Store API uses session cookie, not cart ID in URL)
   */
  async getCartByCartId(cartId: string) {
    const cart = await this.get<WooCommerceCartResponse>("/wp-json/wc/store/v1/cart");
    console.log("fetched cart", cart);
    return transformIntoCart(cart);
  }

  /**
   * Add item to cart
   */
  async addToCart({
    productId,
    variantId,
    qty,
    cartId,
    lineId,
  }: {
    productId: string;
    variantId: string;
    qty: number;
    cartId?: string | null;
    lineId: string | null;
  }) {
    cartId = await this.ensureCartId(cartId);
    
    const res = await this.post<WooCommerceCartResponse>(
      `/wp-json/wc/store/v1/cart/add-item`,
      {
        id: variantId || productId,
        quantity: qty,
      }
    );

    return transformIntoCart(res);
  }

  /**
   * Remove item from cart
   */
  async removeCart({
    cartId,
    lineId = null,
  }: {
    cartId: string;
    lineId: string | null;
  }) {
    cartId = await this.ensureCartId(cartId);
    
    if (!lineId) {
      throw new Error("Line item ID is required to remove from cart");
    }
    
    const res = await this.delete<WooCommerceCartResponse>(
      `/wp-json/wc/store/v1/cart/remove-item?key=${lineId}`
    );

    return transformIntoCart(res);
  }

  /**
   * Apply coupon to cart
   */
  async applyCoupon({
    cartId,
    couponCode,
  }: {
    cartId: string;
    couponCode: string;
  }) {
    cartId = await this.ensureCartId(cartId);
    
    const res = await this.post<WooCommerceCartResponse>(
      `/wp-json/wc/store/v1/cart/apply-coupon`,
      {
        code: couponCode,
      }
    );

    return {
      ...transformIntoCart(res),
      lineItems: res.items.map((item) => ({
        ...transformIntoLineItem(item),
        title: item.product.title
      }))
    };
  }

  /**
   * Remove coupon from cart
   */
  async removeCoupon({
    cartId,
    promotionId,
  }: {
    cartId: string;
    promotionId: string;
  }) {
    cartId = await this.ensureCartId(cartId);
    
    const res = await this.delete<{ deleted: boolean }>(
      `/wp-json/wc/store/v1/cart/remove-coupon?code=${promotionId}`
    );
    return res;
  }

  /**
   * Update cart with customer info, shipping address, and billing address
   */
  async updateCart2({
    cartId,
    email,
    billingAddress,
    customer_id,
    shippingAddress,
    phone,
    isBillingAddressSameAsShipping,
  }: any) {
    cartId = await this.ensureCartId(cartId);
    let cartResponse: any = null;

    console.log("updating email and phone");

    // Update customer information
    if (email || customer_id || phone) {
      cartResponse = await this.post(`/wp-json/wc/store/v1/cart/update-customer`, {
        email,
        customer_id,
        metadata: {
          phone
        }
      });
    }

    console.log("called shipping", shippingAddress);

    // Process shipping address
    let shippingAddressId = null;
    if (shippingAddress) {
      const shippingAddressData = transformFromAddress(shippingAddress);
      cartResponse = await this.post(`/wp-json/wc/store/v1/cart/update-customer`, {
        shipping_address: shippingAddressData,
      });
      shippingAddressId = cartResponse?.shipping_address_id || null;
    }

    // Process billing address
    console.log("called billing", billingAddress);
    if (billingAddress && !isBillingAddressSameAsShipping) {
      const billingAddressData = transformFromAddress(billingAddress);
      cartResponse = await this.post(`/wp-json/wc/store/v1/cart/update-customer`, {
        billing_address: billingAddressData,
      });
    } else if (shippingAddress && isBillingAddressSameAsShipping) {
      const shippingAddressData = transformFromAddress(shippingAddress);
      cartResponse = await this.post(`/wp-json/wc/store/v1/cart/update-customer`, {
        billing_address: shippingAddressData,
      });
    }

    return transformIntoCart(cartResponse);
  }

  /**
   * Complete the cart checkout
   */
  async completeCart(cart_id: string) {
    cart_id = await this.ensureCartId(cart_id);
    return this.post(`/wp-json/wc/store/v1/cart/checkout`, {});
  }

  /**
   * Update cart item quantity or add new items
   */
  async updateCart({
    qty,
    cartId,
    lineId = null,
    productId,
    variantId,
    isSelectedForCheckout,
  }: any) {
    cartId = await this.ensureCartId(cartId);

    const body = {
      quantity: qty,
    };

    if (!lineId) {
      // Add new item
      const res = await this.post<WooCommerceCartResponse>(
        `/wp-json/wc/store/v1/cart/add-item`,
        body
      );
      return transformIntoCart(res);
    } else if (qty) {
      // Update existing item
      const res = await this.post<WooCommerceCartResponse>(
        `/wp-json/wc/store/v1/cart/update-item?key=${lineId}`,
        body
      );
      return transformIntoCart(res);
    } else {
      // Remove item
      const res = await this.delete<{ parent: any }>(
        `/wp-json/wc/store/v1/cart/remove-item?key=${lineId}`
      );
      return transformIntoCart(res.parent);
    }
  }

  /**
   * Update shipping rate selection
   */
  async updateShippingRate({
    cartId,
    shippingRateId,
  }: {
    cartId: string;
    shippingRateId: string;
  }) {
    cartId = await this.ensureCartId(cartId);
    
    const res = await this.post<WooCommerceCartResponse>(
      `/wp-json/wc/store/v1/cart/select-shipping-rate`,
      {
        shipping_rate_id: shippingRateId,
      }
    );
    return transformIntoCart(res);
  }
}

function transformFromAddress(address: Partial<any>) {
  if (!address) return address;
  return {
    phone: address.phone,
    address_1: address.address_1 || address.address1,
    address_2: address.address_2 || address.address2,
    city: address.city,
    first_name: address.firstName,
    last_name: address.lastName,
    postal_code: address.zip || address.postcode,
    country_code: address.countryCode?.toLowerCase?.() || address.country?.toLowerCase?.(),
    state: address.state
  };
}

export const cartService = CartService.getInstance();
