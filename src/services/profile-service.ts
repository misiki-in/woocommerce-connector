import { BaseService } from './base.service'
/** ProfileService — present-but-dummy (mirrors litekart-connector); returns dummy data, never throws. */
export class ProfileService extends BaseService {
  private static instance: ProfileService
  static getInstance(): ProfileService { if (!ProfileService.instance) ProfileService.instance = new ProfileService(); return ProfileService.instance }
  async getOne(..._args: any[]): Promise<any> { return this.dummy({}) }
  async save(..._args: any[]): Promise<any> { return this.dummy({}) }
}
export const profileService = ProfileService.getInstance()
