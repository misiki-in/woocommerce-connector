import { BaseService } from './base.service'
import { EP } from '../endpoints'

export class UserService extends BaseService {
  getMe() {
    if (!EP.customers) return this.unsupported('user.getMe')
    return this.get(EP.customers)
  }
  getUser(id: string | number) {
    if (!EP.customers) return this.unsupported('user.getUser')
    return this.get(`${EP.customers}/${id}`)
  }
  signup(data: Record<string, unknown>) {
    if (!EP.customers) return this.unsupported('user.signup')
    return this.post(EP.customers, data)
  }
  updateProfile(data: Record<string, unknown> & { id: string | number }) {
    if (!EP.customers) return this.unsupported('user.updateProfile')
    return this.put(`${EP.customers}/${data.id}`, data)
  }
  deleteUser(id: string | number) {
    if (!EP.customers) return this.unsupported('user.deleteUser')
    return this.delete(`${EP.customers}/${id}`)
  }
  checkEmail(email: string) { void email; return this.unsupported('user.checkEmail') }
  login(data: Record<string, unknown>) { void data; return this.unsupported('user.login') }
  logout() { return this.unsupported('user.logout') }
  forgotPassword(data: Record<string, unknown>) { void data; return this.unsupported('user.forgotPassword') }
  changePassword(data: Record<string, unknown>) { void data; return this.unsupported('user.changePassword') }
  resetPassword(data: Record<string, unknown>) { void data; return this.unsupported('user.resetPassword') }
  getOtp(data: Record<string, unknown>) { void data; return this.unsupported('user.getOtp') }
  verifyOtp(data: Record<string, unknown>) { void data; return this.unsupported('user.verifyOtp') }
  joinAsVendor(data: Record<string, unknown>) { void data; return this.unsupported('user.joinAsVendor') }
}
