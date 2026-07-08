import { BaseService } from './base.service'
/** AddressService — present-but-dummy (mirrors litekart-connector); returns dummy data, never throws. */
export class AddressService extends BaseService {
  private static instance: AddressService
  static getInstance(): AddressService { if (!AddressService.instance) AddressService.instance = new AddressService(); return AddressService.instance }
  async list(..._args: any[]): Promise<any> { return this.emptyPage() }
  async fetchAddress(..._args: any[]): Promise<any> { return this.emptyPage() }
  async saveAddress(..._args: any[]): Promise<any> { return this.dummy({}) }
  async editAddress(..._args: any[]): Promise<any> { return this.dummy({}) }
  async deleteAddress(..._args: any[]): Promise<any> { return this.dummy({}) }
}
export const addressService = AddressService.getInstance()
