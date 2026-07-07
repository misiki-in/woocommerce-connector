import { BaseService } from './base.service'

export class UploadService extends BaseService {
  uploadToS3(data: Record<string, unknown>) { void data; return this.unsupported('upload.uploadToS3') }
  uploadMultipleToS3(data: Record<string, unknown>) { void data; return this.unsupported('upload.uploadMultipleToS3') }
  deleteFromS3(data: Record<string, unknown>) { void data; return this.unsupported('upload.deleteFromS3') }
}
