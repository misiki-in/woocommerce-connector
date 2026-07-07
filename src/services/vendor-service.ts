import { BaseService } from './base.service'
import { EP } from '../endpoints'

export class VendorService extends BaseService {
  list(opts: { page?: number; perPage?: number; search?: string } = {}) {
    if (!EP.vendors) return this.unsupported('vendor.list')
    return this.listAt(EP.vendors, opts)
  }
  getVendor(id: string | number) {
    if (!EP.vendors) return this.unsupported('vendor.getVendor')
    return this.get(`${EP.vendors}/${id}`)
  }
  save(data: Record<string, unknown>) {
    if (!EP.vendors) return this.unsupported('vendor.save')
    return this.post(EP.vendors, data)
  }
  update(data: Record<string, unknown> & { id: string | number }) {
    if (!EP.vendors) return this.unsupported('vendor.update')
    return this.put(`${EP.vendors}/${data.id}`, data)
  }
  fetchMyVendorDetails() { return this.unsupported('vendor.fetchMyVendorDetails') }
  fetchDashboard() { return this.unsupported('vendor.fetchDashboard') }
  fetchProductsOfVendor(vendorId: string | number) { void vendorId; return this.unsupported('vendor.fetchProductsOfVendor') }
  getAllVendorRatings(vendorId: string | number) { void vendorId; return this.unsupported('vendor.getAllVendorRatings') }
}
