import { BaseService } from './base.service'
/** GalleryService — present-but-dummy (mirrors litekart-connector); returns dummy data, never throws. */
export class GalleryService extends BaseService {
  private static instance: GalleryService
  static getInstance(): GalleryService { if (!GalleryService.instance) GalleryService.instance = new GalleryService(); return GalleryService.instance }
  async fetchGallery(..._args: any[]): Promise<any> { return this.emptyPage() }
}
export const galleryService = GalleryService.getInstance()
