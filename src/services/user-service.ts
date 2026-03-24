<<<<<<< HEAD
import type { User } from '../types'
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

type UserExtended = {
  userId: string
  role: string
} | User

function deleteMeCookie() {
  document.cookie = 'me=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}
function saveUserAsMeCookie(user: UserExtended) {
  const me = encodeURIComponent(JSON.stringify(user))
  document.cookie = 'me=' + me
}

function customerToUser(customer: WooCommerceCustomer): UserExtended {
  return { 
    ...customer, 
    userId: customer.id.toString(), 
    role: "USER",
    id: customer.id.toString(),
    firstName: customer.first_name,
    lastName: customer.last_name,
    email: customer.email,
    phone: customer.billing?.phone || '',
    avatar: customer.avatar_url
  }
}

=======
import type { User } from '../types/index.js'
import { BaseService } from './base-service.js'

// Browser-compatible cookie functions (no-op in Node.js)
function deleteMeCookie() {
  if (typeof document !== 'undefined') {
    document.cookie = 'me=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;'
  }
}

function saveUserAsMeCookie(user: User) {
  if (typeof document !== 'undefined') {
    const me = encodeURIComponent(JSON.stringify(user))
    document.cookie = 'me=' + me + ';path=/;'
  }
}

function getMeFromCookie(): User | null {
  if (typeof document !== 'undefined') {
    const name = 'me='
    const decodedCookie = decodeURIComponent(document.cookie)
    const ca = decodedCookie.split(';')
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === ' ') {
        c = c.substring(1)
      }
      if (c.indexOf(name) === 0) {
        try {
          return JSON.parse(c.substring(name.length, c.length)) as User
        } catch (e) {
          return null
        }
      }
    }
  }
  return null
}

function customerToUser(customer: any): User {
  return {
    id: customer.id?.toString() || '',
    email: customer.email || '',
    firstName: customer.first_name || '',
    lastName: customer.last_name || '',
    phone: customer.billing?.phone || customer.shipping?.phone || null,
    active: true,
    avatar: customer.avatar_url || null,
    role: 'USER',
    createdAt: customer.date_created || '',
    updatedAt: customer.date_modified || '',
  }
}

/**
 * UserService provides functionality for user account management using the WooCommerce REST API.
 */
>>>>>>> f348a1b (feat: product listing)
export class UserService extends BaseService {
  private static instance: UserService

  /**
   * Get the singleton instance
   *
   * @returns {UserService} The singleton instance of UserService
   */
  static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService()
    }
    return UserService.instance
  }

<<<<<<< HEAD
  // Get current authenticated user (admin)
  async getMe() {
    return this.get<User>('/admin/users/me')
  }

  // Get specific user by ID (admin only)
  async getUser(id: string) {
    return this.get<User>(`/admin/users/${id}`)
  }

  // Customer registration
=======
  /**
   * Retrieves the currently authenticated user's profile from Store API session
   *
   * @returns {Promise<User | null>} The current user's profile data
   */
  async getMe(): Promise<User | null> {
    try {
      const res = await this.get<any>('/wp-json/wc/store/v1/checkout')
      
      // If we have a valid customer ID in the session
      if (res.customer_id && res.customer_id > 0) {
        const user: User = {
          id: res.customer_id.toString(),
          email: res.billing_address?.email || '',
          firstName: res.billing_address?.first_name || '',
          lastName: res.billing_address?.last_name || '',
          phone: res.billing_address?.phone || null,
          active: true,
          role: 'USER',
          createdAt: '',
          updatedAt: '',
        }
        saveUserAsMeCookie(user)
        return user
      }
    } catch (e) {
      console.warn('Store API session check failed, falling back to cookie', e)
    }
    
    return getMeFromCookie()
  }

  /**
   * Retrieves a specific user (customer) by ID using Admin API
   *
   * @param {string} id - The ID of the user to fetch
   * @returns {Promise<User>} The requested user's profile data
   */
  async getUser(id: string): Promise<User> {
    const res = await this.get<any>(`/wp-json/wc/v3/customers/${id}`)
    return customerToUser(res)
  }

  /**
   * Registers a new user account (creates a WooCommerce customer)
   *
   * @param {Object} params - The user registration data
   * @returns {Promise<User>} The created user account
   */
>>>>>>> f348a1b (feat: product listing)
  async signup({
    firstName,
    lastName,
    phone,
    email,
    password,
<<<<<<< HEAD
    cartId = null
=======
    cartId = null,
    origin
>>>>>>> f348a1b (feat: product listing)
  }: {
    firstName: string
    lastName: string
    phone: string
    email: string
    password: string
    cartId?: string | null
<<<<<<< HEAD
  }) {
    try {
      const createRes = await this.post<WooCommerceCustomer>('/wp-json/wc/v3/customers', {
=======
    origin: string
  }): Promise<User> {
    try {
      const res = await this.post<any>('/wp-json/wc/v3/customers', {
>>>>>>> f348a1b (feat: product listing)
        email,
        first_name: firstName,
        last_name: lastName,
        password,
        billing: {
          first_name: firstName,
          last_name: lastName,
<<<<<<< HEAD
          phone,
          email
        },
        shipping: {
          first_name: firstName,
          last_name: lastName
        }
      })
      
      const user = customerToUser(createRes)
=======
          email,
          phone
        },
        shipping: {
          first_name: firstName,
          last_name: lastName,
          phone
        }
      })
      const user = customerToUser(res)
>>>>>>> f348a1b (feat: product listing)
      saveUserAsMeCookie(user)
      return user
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to signup'
      throw new Error(errorMessage)
    }
  }

<<<<<<< HEAD
  // Login for customer
  async login({ email, password, cartId = null }: { email: string; password: string; cartId?: string | null }) {
    try {
      // WooCommerce doesn't have a direct login endpoint for REST API
      // Customer authentication is typically handled by WordPress authentication
      // For now, we'll get customer by email and simulate login
      const customers = await this.get<WooCommerceCustomer[]>(`/wp-json/wc/v3/customers?email=${email}`)
      if (customers.length === 0) {
        throw new Error('Customer not found')
      }
      
      const user = customerToUser(customers[0])
      saveUserAsMeCookie(user)
      return user
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to login'
      throw new Error(errorMessage)
    }
  }

  // Logout (handled client-side in WooCommerce by removing auth token)
  async logout() {
    deleteMeCookie()
    return null
  }

  // Forgot password (customer)
  async forgotCustomerPassword(email: string) {
    // WooCommerce handles password reset through WordPress
    // This would typically redirect to WordPress password reset page
    throw new Error('Password reset should be handled through WordPress admin')
  }

  async joinAsVendor({
    firstName,
    lastName,
    businessName,
    phone,
    email,
    password,
    passwordConfirmation,
    cartId = null,
    origin
  }: {
    firstName: string
    lastName: string
    businessName: string
    phone: string
    email: string
    password: string
    passwordConfirmation: string
    cartId?: string | null
    origin: string
  }) {
    return Promise.resolve()
    /*
    return this.post<User>('/api/auth/join-as-vendor', {
      firstName,
      lastName,
      businessName,
      phone,
      email,
      password,
      cartId,
      origin
    })
    */
  }

  // Reset password (customer)
  async resetPassword({ token, email, password }: { token: string; email: string; password: string }) {
    // WooCommerce handles password reset through WordPress
    throw new Error('Password reset should be handled through WordPress admin')
  }

  // Update user profile (customer)
=======
  /**
   * Placeholder for login (not supported by direct WooCommerce REST API without plugins)
   */
  async login({
    email,
    password,
    cartId = null
  }: {
    email: string
    password: string
    cartId?: string | null
  }): Promise<{ token: string; user: User }> {
    // Note: Standard WooCommerce REST API does not support authentication with email/password.
    // This usually requires a JWT Auth plugin or similar.
    // We provide a stub that returns the user if found by email, but this is NOT secure.
    const search = await this.get<any[]>('/wp-json/wc/v3/customers', { email })
    if (search.length === 0) {
      throw new Error('User not found')
    }
    
    const user = customerToUser(search[0])
    saveUserAsMeCookie(user)
    
    return {
      token: 'STUB_TOKEN',
      user
    }
  }

  /**
   * Logs out the current user by clearing the local cookie
   */
  async logout(): Promise<boolean> {
    deleteMeCookie()
    return true
  }

  /**
   * Updates a user's profile information
   */
>>>>>>> f348a1b (feat: product listing)
  async updateProfile({
    id,
    firstName,
    lastName,
    email,
<<<<<<< HEAD
    phone
=======
    phone,
    avatar
>>>>>>> f348a1b (feat: product listing)
  }: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
<<<<<<< HEAD
  }) {
    return this.put<WooCommerceCustomer>(`/wp-json/wc/v3/customers/${id}`, {
      first_name: firstName,
      last_name: lastName,
      email,
      billing: {
        first_name: firstName,
        last_name: lastName,
        phone,
        email
      }
    })
  }

  // Check if email exists (customer)
  async checkEmail(email: string) {
    try {
      const customers = await this.get<WooCommerceCustomer[]>(`/wp-json/wc/v3/customers?email=${email}`)
      return { exists: customers.length > 0 }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Failed to check email"
      throw new Error(errorMessage)
    }
  }

  // Delete user (admin)
  async deleteUser(id: string) {
    return this.delete<WooCommerceCustomer>(`/wp-json/wc/v3/customers/${id}`)
=======
    avatar?: string
  }): Promise<User> {
    const res = await this.put<any>(`/wp-json/wc/v3/customers/${id}`, {
      first_name: firstName,
      last_name: lastName,
      email,
      billing: { phone },
      avatar_url: avatar
    })
    const user = customerToUser(res)
    saveUserAsMeCookie(user)
    return user
  }

  /**
   * Check if an email address is already in use
   */
  async checkEmail(email: string): Promise<boolean> {
    try {
      const res = await this.get<any[]>('/wp-json/wc/v3/customers', { email })
      return res.length > 0
    } catch (e) {
      return false
    }
  }

  /**
   * Delete a user account (Admin only)
   */
  async deleteUser(id: string): Promise<boolean> {
    await this.delete(`/wp-json/wc/v3/customers/${id}`)
    return true
>>>>>>> f348a1b (feat: product listing)
  }
}

export const userService = UserService.getInstance()
<<<<<<< HEAD

/*
    // Invite admin user
  static async inviteUser(email: string) {
    return ApiService.post<User>('/admin/users/invite', {
      email
    })
  }

  // Accept admin invite
  static async acceptInvite({
    token,
    user
  }: {
    token: string
    user: {
      first_name: string
      last_name: string
      password: string
    }
  }) {
    return ApiService.post<User>('/admin/users/invite/accept', {
      token,
      user
    })
  }

  // Admin user creation (typically done through invites)
  async createAdminUser({ firstName, lastName, email }: { firstName: string; lastName: string; email: string }) {
    return ApiService.post<User>('/admin/users', {
      first_name: firstName,
      last_name: lastName,
      email
    })
  }

  // Login for admin user
  static async adminLogin({ email, password }: { email: string; password: string }) {
    return ApiService.post<{ user: User }>('/auth/user/emailpass', {
      email,
      password
    })
  }

  // Forgot password (admin)
  static async forgotAdminPassword(email: string) {
    return ApiService.post<void>('/auth/user/emailpass/reset-password', {
      email
    })
  }

  // Reset password (admin)
  static async resetAdminPassword({ token, email, password }: { token: string; email: string; password: string }) {
    return ApiService.post<User>('/auth/user/emailpass/update', {
      token,
      email,
      password
    })
  }

*/
=======
>>>>>>> f348a1b (feat: product listing)
