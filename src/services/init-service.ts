import { BaseService } from './base.service'

export class InitService extends BaseService {
  fetchInit() { return this.unsupported('init.fetchInit') }
}
