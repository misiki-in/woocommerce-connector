import { BaseService } from './base.service'

export class GalleryService extends BaseService {
  fetchGallery() { return this.unsupported('gallery.fetchGallery') }
}
