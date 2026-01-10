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

  // Get current authenticated user (admin)
  async getMe() {
    return this.get<User>('/admin/users/me')
  }

  // Get specific user by ID (admin only)
  async getUser(id: string) {
    return this.get<User>(`/admin/users/${id}`)
  }

  // Customer registration
  async signup({
    firstName,
    lastName,
    phone,
    email,
    password,
    cartId = null
  }: {
    firstName: string
    lastName: string
    phone: string
    email: string
    password: string
    cartId?: string | null
  }) {
    try {
      const createRes = await this.post<WooCommerceCustomer>('/wp-json/wc/v3/customers', {
        email,
        first_name: firstName,
        last_name: lastName,
        password,
        billing: {
          first_name: firstName,
          last_name: lastName,
          phone,
          email
        },
        shipping: {
          first_name: firstName,
          last_name: lastName
        }
      })
      
      const user = customerToUser(createRes)
      saveUserAsMeCookie(user)
      return user
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to signup'
      throw new Error(errorMessage)
    }
  }

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
  async updateProfile({
    id,
    firstName,
    lastName,
    email,
    phone
  }: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
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
  }
}

export const userService = UserService.getInstance()

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
