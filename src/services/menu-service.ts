import { BaseService } from './base.service'

export class MenuService extends BaseService {
  list() { return this.unsupported('menu.list') }
}
