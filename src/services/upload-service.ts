import { Upload } from '../types'
import { BaseService } from './base-service'

export class UploadService extends BaseService {
  private static instance: UploadService

  /**
   * Get the singleton instance
   *
   * @returns {UploadService} The singleton instance ofUploadService 
   */
  static getInstance(): UploadService {
    if (!UploadService.instance) {
      UploadService.instance = new UploadService()
    }
    return UploadService.instance
  }
  async uploadToS3({
    file,
    folderName,
    type
  }: {
    file: File
    folderName: string
    type: string
  }): Promise<Upload> {
    return { url: "" }
  }

  async uploadMultipleToS3({
    files,
    folderName,
    type
  }: {
    files: File[]
    folderName: string
    type: string
  }): Promise<Upload[]> {
    // Read all files as base64
    return []
  }
  async deleteFromS3({ url }: { url: string }): Promise<void> {
    // console.log('url', url)
    return
  }
}

// // Use singleton instance
export const uploadService = UploadService.getInstance()

