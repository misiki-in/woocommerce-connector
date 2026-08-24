import { BaseService } from './base.service'
/** UploadService — present-but-dummy (mirrors the storefront contract); returns dummy data, never throws. */
export class UploadService extends BaseService {
  private static instance: UploadService
  static getInstance(): UploadService { if (!UploadService.instance) UploadService.instance = new UploadService(); return UploadService.instance }
  async uploadToS3(..._args: any[]): Promise<any> { return this.dummy({}) }
  async uploadMultipleToS3(..._args: any[]): Promise<any> { return this.dummy({}) }
  async deleteFromS3(..._args: any[]): Promise<any> { return this.dummy({}) }
}
export const uploadService = UploadService.getInstance()
