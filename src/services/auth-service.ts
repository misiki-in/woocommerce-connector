import type { User } from '../types'
import { BaseService } from './base.service'

const dummyUser = (over: Partial<User> = {}): User => ({
  id: over.id || 'user_dummy', email: over.email || '', phone: null, firstName: over.firstName ?? null,
  lastName: over.lastName ?? null, avatar: null, role: 'USER', status: 'active', cartId: null,
  isApproved: true, isDeleted: false, isEmailVerified: true, isPhoneVerified: false,
  signInCount: 1, otpAttempt: 0, userAuthToken: null,
  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...over
})

/**
 * AuthService — WooCommerce. The kitcommerce-core auth-state (me + connect.sid
 * cookies, role: 'USER') is set on login regardless of vendor auth. Vendor-specific
 * login is best-effort and should be tuned per vendor.
 */
export class AuthService extends BaseService {
  private static instance: AuthService
  static getInstance(): AuthService { if (!AuthService.instance) AuthService.instance = new AuthService(); return AuthService.instance }

  private setAuthCookies(user: User): void {
    this.setCookie('connect.sid', `s:${user.id || 'session'}.${Date.now()}`)
    this.setCookie('me', JSON.stringify({
      userId: user.id || null, phone: user.phone ?? null, email: user.email || null,
      firstName: user.firstName ?? null, lastName: user.lastName ?? null, avatar: user.avatar ?? null,
      role: 'USER', storeId: this.creds.storeId || null
    }))
  }

  async login({ email }: { email: string; password: string; cartId?: string | null }): Promise<User> {
    // Vendor-specific authentication would set access tokens here; the auth-state
    // cookies below are what kitcommerce-core relies on.
    const user = dummyUser({ email })
    this.setAuthCookies(user)
    return user
  }
  async getMe(): Promise<User> { return dummyUser() }
  async getUser(id: string): Promise<User> { return dummyUser({ id }) }
  async signup(a: { firstName: string; lastName: string; email: string; password: string }): Promise<User> {
    const user = dummyUser({ email: a.email, firstName: a.firstName, lastName: a.lastName }); this.setAuthCookies(user); return user
  }
  async logout() { this.setCookie('connect.sid', '', -1); this.setCookie('me', '', -1); return this.dummy({ success: true }) }
  async verifyEmail(_e: string, _t: string) { return this.dummy({ success: true }) }
  async forgotPassword(_a: any) { return this.dummy({ success: true }) }
  async changePassword(_a: any) { return this.dummy({ success: true }) }
  async resetPassword(_a: any) { return this.dummy({ success: true }) }
  async getOtp(_a: any) { return this.dummy({ success: true }) }
  async verifyOtp(_a: any) { return this.dummy({ success: true }) }
  async joinAsVendor(_a: any) { return this.dummy({ success: true }) }
  async joinAsAdmin(_a: any) { return this.dummy({ success: true }) }
  async updateProfile(a: { id: string; firstName?: string; lastName?: string; email?: string }) { return dummyUser({ id: a.id, email: a.email, firstName: a.firstName, lastName: a.lastName }) }
}
export const authService = AuthService.getInstance()
