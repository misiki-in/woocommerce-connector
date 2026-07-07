import { BaseService } from './base.service'

export class PopularityService extends BaseService {
  updatePopularity(data: Record<string, unknown>) { return this.unsupported('popularity.updatePopularity') }
}
