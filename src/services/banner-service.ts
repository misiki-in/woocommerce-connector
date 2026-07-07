import { BaseService } from './base.service'

export class BannerService extends BaseService {
  list() { return this.unsupported('banner.list') }
  fetchBannersGroup() { return this.unsupported('banner.fetchBannersGroup') }
}
