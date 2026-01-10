import type { User, verifyEmail } from '../types'
import { BaseService } from './base-service'

export class AuthService extends BaseService {
  private static instance:AuthService 

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  async getMe() {
    return this.get<User>('/store/customers/me')
  }

  async verifyEmail(email: string, token: string) {
    return this.post<verifyEmail>('/auth/customer/email/verify', {
      email,
      token
    })
  }

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
    passwordConfirmation: string
    cartId?: string | null
  }) {
    const payload = {
      first_name: firstName,
      last_name: lastName,
      email,
      password,
      phone
    }

    const response = await this.post<User>('/store/customers', payload)

    // If cartId exists, associate the cart with the new customer


    return response
  }

  async joinAsVendor({
    firstName,
    lastName,
    businessName,
    phone,
    email,
    password,

    role,
    origin
  }: {
    firstName: string
    lastName: string
    businessName: string
    phone: string
    email: string
    password: string
    role: string
    origin: string
  }) {
    // Note: This implementation assumes a custom endpoint would be added
    return this.post<User>('/auth/customer/email/register', {
      first_name: firstName,
      last_name: lastName,
      business_name: businessName,
      phone,
      email,
      password,
      role,
      origin
    })
  }

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
    origin: string
  }) {
    // Note: Admin APIs are handled differently
    // For consistency with the original function, we'll keep it but note the limitation
    return this.post<User>('/admin/auth/register', {
      first_name: firstName,
      last_name: lastName,
      business_name: businessName,
      phone,
      email,
      password,
      origin
    })
  }

  async login({ email, password, cartId = null }: { email: string; password: string; cartId?: string | null }) {
    const response = await this.post<User>('/auth/session', {
      email,
      password
    })


    return response
  }

  async forgotPassword({ email, referrer }: { email: string; referrer: string }) {
    return this.post<User>('/auth/customer/email/reset-password', {
      email,
      referrer
    })
  }

  async changePassword(body: { old: string; password: string }) {
    return this.post<User>('/auth/customer/email/update', {
      old_password: body.old,
      new_password: body.password
    })
  }

  async resetPassword({ userId, token, password }: { userId: string; token: string; password: string }) {
    return this.post<User>('/auth/customer/email/reset-password', {
      token,
      password
    })
  }

  async getOtp({ phone }: { phone: string }) {
    // Note: Standard platform doesn't have OTP functionality
    // This would be a custom implementation
    return this.post<User>('/auth/customer/phone/otp', { phone })
  }

  async verifyOtp({ phone, otp }: { phone: string; otp: string }) {
    // Note: Standard platform doesn't have OTP functionality
    // This would be a custom implementation
    return this.post<User>('/auth/customer/phone/verify', { phone, otp })
  }

  async logout() {
    return this.delete('/auth/session')
  }

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
    return this.post('/auth/customer/email/update', {
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      avatar
    })
  }
}

export const authService = AuthService.getInstance()
