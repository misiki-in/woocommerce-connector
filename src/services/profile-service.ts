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
  static getInstance(): ProfileService {
    if (!ProfileService.instance) {
      ProfileService.instance = new ProfileService()
    }
    return ProfileService.instance
  }

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
}

export const profileService = ProfileService.getInstance()
