import { BaseService } from './base.service'

export class ReelsService extends BaseService {
  list() { return this.unsupported('reels.list') }
}
