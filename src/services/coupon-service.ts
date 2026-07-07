import { BaseService } from './base.service'
import { EP } from '../endpoints'

export class CouponService extends BaseService {
  listCoupons(opts: { page?: number; perPage?: number; search?: string } = {}) {
    if (!EP.coupons) return this.unsupported('coupon.listCoupons')
    return this.listAt(EP.coupons, opts)
  }
  searchCoupons(opts: { page?: number; perPage?: number; search?: string } = {}) {
    if (!EP.coupons) return this.unsupported('coupon.searchCoupons')
    return this.listAt(EP.coupons, opts)
  }
  getCoupon(id: string | number) {
    if (!EP.coupons) return this.unsupported('coupon.getCoupon')
    return this.get(`${EP.coupons}/${id}`)
  }
  createCoupon(data: Record<string, unknown>) {
    if (!EP.coupons) return this.unsupported('coupon.createCoupon')
    return this.post(EP.coupons, data)
  }
  patchCoupon(id: string | number, data: Record<string, unknown>) {
    if (!EP.coupons) return this.unsupported('coupon.patchCoupon')
    return this.patch(`${EP.coupons}/${id}`, data)
  }
  deleteCoupon(id: string | number) {
    if (!EP.coupons) return this.unsupported('coupon.deleteCoupon')
    return this.delete(`${EP.coupons}/${id}`)
  }
}
