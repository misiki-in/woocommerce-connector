import { BaseService } from './base.service'

export class DealService extends BaseService {
  fetchDeals() { return this.unsupported('deal.fetchDeals') }
}
