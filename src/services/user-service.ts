import type { User } from '../types'
import { AuthService } from './auth-service'
import { BaseService } from './base.service'
/** UserService — auth-flow methods delegate to AuthService. */
export class UserService extends BaseService {
  private static instance: UserService
  static getInstance(): UserService { if (!UserService.instance) UserService.instance = new UserService(); return UserService.instance }
  private get auth() { return AuthService.getInstance() }
  async getMe(): Promise<User> { return this.auth.getMe() }
  async getUser(id: string): Promise<User> { return this.auth.getUser(id) }
  async login(a: any): Promise<User> { return this.auth.login(a) }
  async signup(a: any): Promise<User> { return this.auth.signup(a) }
  async logout() { return this.auth.logout() }
  async updateProfile(a: any) { return this.auth.updateProfile(a) }
  async forgotPassword(a: any) { return this.auth.forgotPassword(a) }
  async changePassword(a: any) { return this.auth.changePassword(a) }
  async resetPassword(a: any) { return this.auth.resetPassword(a) }
  async getOtp(a: any) { return this.auth.getOtp(a) }
  async verifyOtp(a: any) { return this.auth.verifyOtp(a) }
  async joinAsVendor(a: any) { return this.auth.joinAsVendor(a) }
  async checkEmail(_e: string) { return this.dummy({ exists: false }) }
  async deleteUser(_id: string) { return this.dummy({ success: true }) }
}
export const userService = UserService.getInstance()
