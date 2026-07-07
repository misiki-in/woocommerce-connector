import { BaseService } from './base.service'

export class HomeService extends BaseService {
  getHome() { return this.unsupported('home.getHome') }
}
