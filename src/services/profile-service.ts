import type { User } from '../types'
import { NotSupportedError } from '../errors'
import { AuthService } from './auth-service'
import { BaseService } from './base.service'

/**
 * WooCommerce customer -> storefront User.
 * docs: https://woocommerce.github.io/woocommerce-rest-api-docs/#customer-properties
 */
function toUser(c: any): User {
  return {
    id: String(c?.id ?? ''),
    // Phone only exists on the billing address in WooCommerce.
    phone: c?.billing?.phone || null,
    email: String(c?.email ?? ''),
    status: c?.role ?? null,
    avatar: c?.avatar_url ?? null,
    cartId: null,
    firstName: c?.first_name ?? null,
    lastName: c?.last_name ?? null,
    // WooCommerce has no approval, soft-delete, verification, sign-in-count or OTP
    // fields on a customer; these are filled with neutral defaults, not read from the API.
    isApproved: true,
    isDeleted: false,
    isEmailVerified: false,
    isPhoneVerified: false,
    role: c?.role ?? null,
    signInCount: 0,
    otpAttempt: 0,
    userAuthToken: null,
    createdAt: c?.date_created_gmt || c?.date_created || '',
    updatedAt: c?.date_modified_gmt || c?.date_modified || ''
  }
}

/**
 * ProfileService — WooCommerce. Signatures mirror the storefront contract.
 *
 * WooCommerce v3 has no "current customer" route: a ck/cs consumer key identifies the
 * application, not a shopper. Everything here therefore needs an explicit customer id.
 */
export class ProfileService extends BaseService {
  private static instance: ProfileService
  static getInstance(): ProfileService { if (!ProfileService.instance) ProfileService.instance = new ProfileService(); return ProfileService.instance }

  /**
   * PLACEHOLDER (delegated): there is no current-customer endpoint in WooCommerce v3, and
   * WP core's /wp/v2/users/me needs a real WordPress credential that this connector does not
   * hold. Delegates to AuthService.getMe() so identity has exactly one source of truth;
   * it throws NotSupportedError rather than fabricating a signed-in user (auth bypass).
   */
  async getOne(): Promise<User> {
    return AuthService.getInstance().getMe()
  }

  /**
   * Updates a customer via PUT /wp-json/wc/v3/customers/{id}
   * (docs: https://woocommerce.github.io/woocommerce-rest-api-docs/#update-a-customer).
   *
   * The storefront contract types the argument as Omit<User, 'id'>; WooCommerce cannot resolve "me", so the
   * id must be supplied on the object. Without it we throw instead of guessing a customer
   * (resolving by email would let any caller overwrite any account).
   */
  async save(user: Omit<User, 'id'> & { id?: string }): Promise<User> {
    const id = user?.id
    if (!id) {
      throw new NotSupportedError(
        'ProfileService',
        'save',
        'WooCommerce has no current-customer route; pass the WooCommerce customer id on the payload (PUT /customers/{id})'
      )
    }
    const body: Record<string, unknown> = {}
    if (user.firstName !== undefined) body.first_name = user.firstName ?? ''
    if (user.lastName !== undefined) body.last_name = user.lastName ?? ''
    if (user.email !== undefined) body.email = user.email
    // Phone lives on the billing address, not on the customer root.
    if (user.phone !== undefined) body.billing = { phone: user.phone ?? '' }
    const raw = await this.put<any>(`/customers/${encodeURIComponent(id)}`, body)
    return toUser(raw)
  }
}

export const profileService = ProfileService.getInstance()
