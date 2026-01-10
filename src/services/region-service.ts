import { AxiosError } from 'axios';
import type { Region } from '../types'
import { ApiService } from './api-service'

export class RegionService {
	/**
	 * Get region information by region ID
	 * @param id - Region ID
	 * @returns Region details
	 */
	static async getRegionByRegionId(id: string) {
		try {
			const response = await ApiService.get<{ region: Region }>(
        `/store/regions/${id}`
      );

			return response
		} catch (error) {
      const axiosError = error as AxiosError;
			console.error(
        "Error fetching region:",
        axiosError?.response?.data || axiosError?.message,
        "Request Config:",
        axiosError?.config
      );
			// Return default data on error
			return {
				id: 'error-placeholder',
				name: 'Error Region',
				currency_code: 'USD',
				countries: []
			}
		}
	}

	/**
	 * List all available regions
	 * @returns Available regions
	 */
	static async listRegions() {
		try {
			const response = await ApiService.get<{regions: Region[]}>(`/store/regions`)

			return response
		} catch (error) {
      const axiosError = error as AxiosError;
			console.error(
        "Error fetching regions:",
        axiosError?.response?.data || axiosError?.message,
        "Request Config:",
        axiosError?.config
      );
			return {
				regions: []
			}
		}
	}
}
