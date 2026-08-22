import type { User } from '../types'
import { AuthService } from './auth-service'
import { BaseService } from './base.service'

/**
 * UserService — WooCommerce. Signatures mirror @misiki/litekart-connector.
 *
 * Every auth-flow method delegates to AuthService so there is a single place where the
 * "WooCommerce v3 has no shopper session" reality is enforced (no login, no logout, no
 * password reset, no OTP; a ck/cs key identifies the app, not a shopper).
 * Only the two methods WooCommerce genuinely serves — an email lookup and a customer
 * delete — issue requests from here.
 */
export class UserService extends BaseService {
  private static instance: UserService
  static getInstance(): UserService { if (!UserService.instance) UserService.instance = new UserService(); return UserService.instance }
  private get auth() { return AuthService.getInstance() }

  /** PLACEHOLDER (delegated): no current-user route under ck/cs. See AuthService.getMe(). */
  async getMe(): Promise<User> { return this.auth.getMe() }

  /** PLACEHOLDER (delegated): AuthService.getUser() currently throws. v3 GET /customers/{id} exists but is not wired. */
  async getUser(id: string): Promise<User> { return this.auth.getUser(id) }

  /** PLACEHOLDER (delegated): WooCommerce has no login endpoint; JWT needs a plugin. */
  async login(a: { email: string; password: string; cartId?: string | null }): Promise<User> { return this.auth.login(a) }

  /** PLACEHOLDER (delegated): AuthService.signup() currently throws. v3 POST /customers exists but is not wired. */
  async signup(a: {
    firstName: string
    lastName: string
    phone: string
    email: string
    password: string
    passwordConfirmation: string | null
    cartId?: string | null
    origin: string
  }): Promise<User> { return this.auth.signup(a) }

  /** Local cookie clear only — there is no server-side session to end. */
  async logout() { return this.auth.logout() }

  /** PLACEHOLDER (delegated): AuthService.updateProfile() currently throws. Use ProfileService.save(), which is wired to v3 PUT /customers/{id}. */
  async updateProfile(a: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
    avatar?: string
  }) { return this.auth.updateProfile(a) }

  /** PLACEHOLDER (delegated): WooCommerce/WP core expose no password-reset REST route. */
  async forgotPassword(a: { email: string; referrer: string }) { return this.auth.forgotPassword(a) }

  /**
   * PLACEHOLDER (delegated): PUT /customers/{id} { password } would set a new password but
   * nothing in the REST API verifies `old`, which turns this into an unauthenticated reset.
   */
  async changePassword(a: { old: string; password: string }) { return this.auth.changePassword(a) }

  /** PLACEHOLDER (delegated): no reset-token endpoint exists in WooCommerce or WP core. */
  async resetPassword(a: { userId: string; token: string; password: string }) { return this.auth.resetPassword(a) }

  /** PLACEHOLDER (delegated): WooCommerce has no OTP concept. */
  async getOtp(a: {
    firstName: string
    lastName: string
    phone: string
    email: string
    password: string
    passwordConfirmation: string
  }) { return this.auth.getOtp(a) }

  /** PLACEHOLDER (delegated): WooCommerce has no OTP concept. */
  async verifyOtp(a: { phone: string; otp: string }) { return this.auth.verifyOtp(a) }

  /** PLACEHOLDER (delegated): WooCommerce core is single-vendor; there is no vendor signup. */
  async joinAsVendor(a: {
    firstName: string
    lastName: string
    businessName: string
    phone: string
    email: string
    password: string
    passwordConfirmation: string
    cartId?: string | null
    origin: string
  }) { return this.auth.joinAsVendor(a) }

  /**
   * `email` is a documented filter on the customers collection
   * (docs: https://woocommerce.github.io/woocommerce-rest-api-docs/#list-all-customers,
   * "email — Limit result set to resources with a specific email").
   *
   * NOTE: this is an account-enumeration oracle. It requires the ck/cs key and should only
   * ever be called server-side.
   */
  async checkEmail(email: string): Promise<{ exists: boolean }> {
    const arr = await this.get<any[]>('/customers' + this.qs({ email, per_page: 1 }))
    return { exists: Array.isArray(arr) && arr.length > 0 }
  }

  /**
   * DELETE /wp-json/wc/v3/customers/{id}?force=true
   * The docs mark `force` as "Required to be true, as resource does not support trashing"
   * (https://woocommerce.github.io/woocommerce-rest-api-docs/#delete-a-customer).
   * Optional `reassign` moves the user's posts to another user id.
   * BaseService.delete() takes no body, so both go on the query string.
   */
  async deleteUser(id: string, reassign?: string | number) {
    await this.delete(`/customers/${encodeURIComponent(id)}` + this.qs({ force: true, reassign }))
    return { success: true }
  }
}

export const userService = UserService.getInstance()
