import type { User, verifyEmail } from '../types'
import { BaseService } from './base-service'

type WooCommerceCustomer = {
  id: number
  date_created: string
  date_created_gmt: string
  date_modified: string
  date_modified_gmt: string
  email: string
  first_name: string
  last_name: string
  role: string
  username: string
  billing: {
    first_name: string
    last_name: string
    company: string
    address_1: string
    address_2: string
    city: string
    state: string
    postcode: string
    country: string
    email: string
    phone: string
  }
  shipping: {
    first_name: string
    last_name: string
    company: string
    address_1: string
    address_2: string
    city: string
    state: string
    postcode: string
    country: string
  }
  avatar_url: string
  meta_data: any[]
}

function customerToUser(customer: WooCommerceCustomer): User {
  return {
    id: customer.id.toString(),
    userId: customer.id.toString(),
    firstName: customer.first_name,
    lastName: customer.last_name,
    email: customer.email,
    phone: customer.billing?.phone || '',
    avatar: customer.avatar_url,
    role: customer.role || 'customer',
    createdAt: customer.date_created
  }
}

export class AuthService extends BaseService {
  private static instance: AuthService

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  /**
   * Get current authenticated customer (using WC v3 customers/me endpoint)
   */
  async getMe() {
    const customer = await this.get<WooCommerceCustomer>('/wp-json/wc/v3/customers/me')
    return customerToUser(customer)
  }

  /**
   * Verify email with token
   * Note: WooCommerce doesn't have built-in email verification
   * This would require custom endpoint or plugin
   */
  async verifyEmail(email: string, token: string) {
    throw new Error('Email verification requires custom endpoint or WordPress plugin')
  }

  /**
   * Signup - Create a new customer in WooCommerce
   */
  async signup({
    firstName,
    lastName,
    phone,
    email,
    password,
    passwordConfirmation,
    cartId = null
  }: {
    firstName: string
    lastName: string
    phone: string
    email: string
    password: string
    passwordConfirmation?: string
    cartId?: string | null
  }) {
    if (password !== passwordConfirmation) {
      throw new Error('Passwords do not match')
    }

    const payload = {
      email,
      first_name: firstName,
      last_name: lastName,
      password,
      billing: {
        first_name: firstName,
        last_name: lastName,
        email,
        phone
      },
      shipping: {
        first_name: firstName,
        last_name: lastName
      }
    }

    const customer = await this.post<WooCommerceCustomer>('/wp-json/wc/v3/customers', payload)
    return customerToUser(customer)
  }

  /**
   * Join as vendor
   * Note: WooCommerce doesn't have built-in vendor functionality
   * This would require a multi-vendor plugin like Dokan or WCFM
   */
  async joinAsVendor({
    firstName,
    lastName,
    businessName,
    phone,
    email,
    password,
    role = 'seller',
    origin
  }: {
    firstName: string
    lastName: string
    businessName: string
    phone: string
    email: string
    password: string
    role?: string
    origin?: string
  }) {
    throw new Error('Vendor functionality requires multi-vendor plugin (Dokan, WCFM, etc.)')
  }

  /**
   * Join as admin
   * Note: Admin creation is typically handled through WordPress admin, not REST API
   */
  async joinAsAdmin({
    firstName,
    lastName,
    businessName,
    phone,
    email,
    password,
    origin
  }: {
    firstName: string
    lastName: string
    businessName: string
    phone: string
    email: string
    password: string
    origin?: string
  }) {
    throw new Error('Admin user creation should be done through WordPress admin panel')
  }

  /**
   * Login - WooCommerce doesn't have a direct login endpoint
   * Authentication is typically handled by WordPress cookies/nonces
   * For REST API, we need to use application passwords or JWT
   */
  async login({ email, password, cartId = null }: { email: string; password: string; cartId?: string | null }) {
    try {
      // Try to get customer by email - this validates credentials
      const customers = await this.get<WooCommerceCustomer[]>(`/wp-json/wc/v3/customers?email=${encodeURIComponent(email)}`)
      
      if (customers.length === 0) {
        throw new Error('Customer not found with this email')
      }
      
      // Note: Basic auth with consumer key/secret doesn't validate user passwords
      // For proper user authentication, you'd need JWT or application passwords
      return customerToUser(customers[0])
    } catch (error) {
      throw new Error('Invalid email or password')
    }
  }

  /**
   * Forgot password - WooCommerce handles this through WordPress
   */
  async forgotPassword({ email, referrer }: { email: string; referrer?: string }) {
    throw new Error('Password reset should be handled through WordPress login page or use application passwords')
  }

  /**
   * Change password for authenticated customer
   */
  async changePassword(body: { old: string; password: string }) {
    const customer = await this.post<WooCommerceCustomer>('/wp-json/wc/v3/customers/me', {
      password: body.password
    })
    return customerToUser(customer)
  }

  /**
   * Reset password with token
   */
  async resetPassword({ userId, token, password }: { userId: string; token: string; password: string }) {
    throw new Error('Password reset with token requires custom endpoint')
  }

  /**
   * Get OTP for phone verification
   * Note: Standard WooCommerce doesn't have OTP functionality
   */
  async getOtp({ phone }: { phone: string }) {
    throw new Error('OTP functionality requires custom implementation or plugin')
  }

  /**
   * Verify OTP
   */
  async verifyOtp({ phone, otp }: { phone: string; otp: string }) {
    throw new Error('OTP functionality requires custom implementation or plugin')
  }

  /**
   * Logout - handled client-side
   */
  async logout() {
    // Clear any stored auth data
    if (typeof document !== 'undefined') {
      document.cookie = 'me=;expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    }
    return { success: true }
  }

  /**
   * Update profile for current customer
   */
  async updateProfile({
    id,
    firstName,
    lastName,
    email,
    phone,
    avatar
  }: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
    avatar?: string
  }) {
    const updateData: any = {
      first_name: firstName,
      last_name: lastName,
      email,
      billing: {
        first_name: firstName,
        last_name: lastName,
        email,
        phone
      }
    }

    if (avatar) {
      updateData.meta_data = [{
        key: 'avatar',
        value: avatar
      }]
    }

    // If updating current user, use /me endpoint, otherwise use /customers/{id}
    const endpoint = id === 'me' || id === undefined ? '/wp-json/wc/v3/customers/me' : `/wp-json/wc/v3/customers/${id}`
    const customer = await this.put<WooCommerceCustomer>(endpoint, updateData)
    return customerToUser(customer)
  }
}

export const authService = AuthService.getInstance()
