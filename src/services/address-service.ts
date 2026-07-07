import { BaseService } from './base.service'
import { EP } from '../endpoints'

export class AddressService extends BaseService {
  list(opts: { page?: number; perPage?: number; search?: string } = {}) {
    if (!EP.addresses) return this.unsupported('address.list')
    return this.listAt(EP.addresses, opts)
  }
  fetchAddress(id: string | number) {
    if (!EP.addresses) return this.unsupported('address.fetchAddress')
    return this.get(`${EP.addresses}/${id}`)
  }
  saveAddress(data: Record<string, unknown>) {
    if (!EP.addresses) return this.unsupported('address.saveAddress')
    return this.post(EP.addresses, data)
  }
  editAddress(id: string | number, data: Record<string, unknown>) {
    if (!EP.addresses) return this.unsupported('address.editAddress')
    return this.put(`${EP.addresses}/${id}`, data)
  }
  deleteAddress(id: string | number) {
    if (!EP.addresses) return this.unsupported('address.deleteAddress')
    return this.delete(`${EP.addresses}/${id}`)
  }
}
