import { BaseService } from './base.service'
/** AutocompleteService — present-but-dummy (mirrors litekart-connector); returns dummy data, never throws. */
export class AutocompleteService extends BaseService {
  private static instance: AutocompleteService
  static getInstance(): AutocompleteService { if (!AutocompleteService.instance) AutocompleteService.instance = new AutocompleteService(); return AutocompleteService.instance }
  async list(..._args: any[]): Promise<any> { return this.emptyPage() }
}
export const autocompleteService = AutocompleteService.getInstance()
