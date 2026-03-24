<<<<<<< HEAD
import type { User } from '../types'
import { BaseService } from './base-service'

export class ProfileService extends BaseService {
    private static instance: ProfileService

  /**
   * Get the singleton instance
   */
  /**
 * Get the singleton instance
 * 
 * @returns {ProfileService} The singleton instance of ProfileService
 */
=======
import { BaseService } from './base-service.js'

/**
 * ProfileService provides functionality for managing user profiles.
 */
export class ProfileService extends BaseService {
  private static instance: ProfileService

>>>>>>> f348a1b (feat: product listing)
  static getInstance(): ProfileService {
    if (!ProfileService.instance) {
      ProfileService.instance = new ProfileService()
    }
    return ProfileService.instance
  }

<<<<<<< HEAD
	async getOne() {
		return this.get<User>('/store/customers/me')
	}

	async save(profile: Omit<User, 'id'>) {
		return this.post<User>('/store/customers/me', profile)
	}

	async getAddresses() {
		return this.get('/store/customers/me/addresses')
	}

	async addAddress(address: any) {
		return this.post('/store/customers/me/addresses', address)
	}

	async updateAddress(addressId: string, address: any) {
		return this.post(`/store/customers/me/addresses/${addressId}`, address)
	}

	async deleteAddress(addressId: string) {
		return this.delete(`/store/customers/me/addresses/${addressId}`)
	}

	async register(customerData: any) {
		return this.post('/store/customers', customerData)
	}

	async getAddress(addressId: string) {
		return this.get(`/store/customers/me/addresses/${addressId}`)
	}
=======
  /**
   * Get the current user's profile
   * Note: This assumes the authentication context provides the necessary permissions.
   */
  async getMe() {
    try {
      // WooCommerce doesn't have a direct /customers/me endpoint in the standard REST API
      // that works with Consumer Key/Secret for a specific user easily without their ID.
      // Usually, this is handled via JWT or specific user ID if known.
      return {}
    } catch (error) {
      console.error('Error fetching profile:', error)
      return null
    }
  }

  /**
   * Update the current user's profile
   */
  async updateMe(data: any) {
    return {}
  }
>>>>>>> f348a1b (feat: product listing)
}

export const profileService = ProfileService.getInstance()
