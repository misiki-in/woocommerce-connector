import { BaseService } from './base.service'
/** VendorService — present-but-dummy (mirrors litekart-connector); returns dummy data, never throws. */
export class VendorService extends BaseService {
  private static instance: VendorService
  static getInstance(): VendorService { if (!VendorService.instance) VendorService.instance = new VendorService(); return VendorService.instance }
  async save(..._args: any[]): Promise<any> { return this.dummy({}) }
  async update(..._args: any[]): Promise<any> { return this.dummy({}) }
  async list(..._args: any[]): Promise<any> { return this.emptyPage() }
  async getVendor(..._args: any[]): Promise<any> { return this.dummy({}) }
  async fetchMyVendorDetails(..._args: any[]): Promise<any> { return this.emptyPage() }
  async fetchDashboard(..._args: any[]): Promise<any> { return this.dummy({}) }
  async fetchProductsOfVendor(..._args: any[]): Promise<any> { return this.dummy({}) }
  async getAllVendorRatings(..._args: any[]): Promise<any> { return this.dummy({}) }
}
export const vendorService = VendorService.getInstance()
