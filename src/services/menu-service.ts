import { BaseService } from './base.service'
/** MenuService — present-but-dummy (mirrors litekart-connector); returns dummy data, never throws. */
export class MenuService extends BaseService {
  private static instance: MenuService
  static getInstance(): MenuService { if (!MenuService.instance) MenuService.instance = new MenuService(); return MenuService.instance }
  async list(..._args: any[]): Promise<any> { return this.emptyPage() }
}
export const menuService = MenuService.getInstance()
