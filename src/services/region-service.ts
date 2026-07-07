import { BaseService } from './base.service'
import { EP } from '../endpoints'

export class RegionService extends BaseService {
  getRegionByRegionId(id: string | number) {
    if (!EP.countries) return this.unsupported('region.getRegionByRegionId')
    return this.get(`${EP.countries}/${id}`)
  }
}
