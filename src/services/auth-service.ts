import { BaseService } from './base.service'
import { EP } from '../endpoints'

export class AuthService extends BaseService {
  getMe() {
    if (!EP.customers) return this.unsupported('auth.getMe')
    return this.get(EP.customers)
  }
  getUser(id: string | number) {
    if (!EP.customers) return this.unsupported('auth.getUser')
    return this.get(`${EP.customers}/${id}`)
  }
  signup(data: Record<string, unknown>) {
    if (!EP.customers) return this.unsupported('auth.signup')
    return this.post(EP.customers, data)
  }
  login(data: Record<string, unknown>) { void data; return this.unsupported('auth.login') }
  logout() { return this.unsupported('auth.logout') }
  verifyEmail(email: string, token: string) { void email; void token; return this.unsupported('auth.verifyEmail') }
  joinAsVendor(data: Record<string, unknown>) { void data; return this.unsupported('auth.joinAsVendor') }
  joinAsAdmin(data: Record<string, unknown>) { void data; return this.unsupported('auth.joinAsAdmin') }
  forgotPassword(data: Record<string, unknown>) { void data; return this.unsupported('auth.forgotPassword') }
  changePassword(data: Record<string, unknown>) { void data; return this.unsupported('auth.changePassword') }
  resetPassword(data: Record<string, unknown>) { void data; return this.unsupported('auth.resetPassword') }
  getOtp(data: Record<string, unknown>) { void data; return this.unsupported('auth.getOtp') }
  verifyOtp(data: Record<string, unknown>) { void data; return this.unsupported('auth.verifyOtp') }
  updateProfile(data: Record<string, unknown> & { id: string | number }) {
    if (!EP.customers) return this.unsupported('auth.updateProfile')
    return this.put(`${EP.customers}/${data.id}`, data)
  }
}
