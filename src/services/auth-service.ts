import type { User } from '../types'
import { NotSupportedError } from '../errors'
import { BaseService } from './base.service'

/**
 * AuthService — WooCommerce.
 *
 * Authentication is NOT yet wired to WooCommerce. Every method that would
 * establish or report an identity throws NotSupportedError rather than
 * fabricating one: returning a synthetic user here would hand the consuming
 * app a logged-in session for any credentials, which is an auth bypass.
 *
 * logout() remains functional because clearing local cookies is correct
 * regardless of how the session was established.
 */
export class AuthService extends BaseService {
  private static instance: AuthService
  static getInstance(): AuthService { if (!AuthService.instance) AuthService.instance = new AuthService(); return AuthService.instance }

  private unsupported(method: string): never {
    throw new NotSupportedError('AuthService', method, 'WooCommerce authentication is not implemented yet')
  }

  async login(_a: { email: string; password: string; cartId?: string | null }): Promise<User> { return this.unsupported('login') }
  async signup(_a: { firstName: string; lastName: string; email: string; password: string }): Promise<User> { return this.unsupported('signup') }
  async getMe(): Promise<User> { return this.unsupported('getMe') }
  async getUser(_id: string): Promise<User> { return this.unsupported('getUser') }
  async updateProfile(_a: { id: string; firstName?: string; lastName?: string; email?: string }): Promise<User> { return this.unsupported('updateProfile') }
  async verifyEmail(_e: string, _t: string): Promise<never> { return this.unsupported('verifyEmail') }
  async forgotPassword(_a: any): Promise<never> { return this.unsupported('forgotPassword') }
  async changePassword(_a: any): Promise<never> { return this.unsupported('changePassword') }
  async resetPassword(_a: any): Promise<never> { return this.unsupported('resetPassword') }
  async getOtp(_a: any): Promise<never> { return this.unsupported('getOtp') }
  async verifyOtp(_a: any): Promise<never> { return this.unsupported('verifyOtp') }
  async joinAsVendor(_a: any): Promise<never> { return this.unsupported('joinAsVendor') }
  async joinAsAdmin(_a: any): Promise<never> { return this.unsupported('joinAsAdmin') }

  /** Clears the local auth cookies. Safe to call regardless of auth backend. */
  async logout() { this.setCookie('connect.sid', '', -1); this.setCookie('me', '', -1); return this.dummy({ success: true }) }
}
export const authService = AuthService.getInstance()
