import { BaseService } from './base.service'
/** CouponService — present-but-dummy (mirrors litekart-connector); returns dummy data, never throws. */
export class CouponService extends BaseService {
  private static instance: CouponService
  static getInstance(): CouponService { if (!CouponService.instance) CouponService.instance = new CouponService(); return CouponService.instance }
  async listCoupons(..._args: any[]): Promise<any> { return this.emptyPage() }
  async searchCoupons(..._args: any[]): Promise<any> { return this.emptyPage() }
  async getCoupon(..._args: any[]): Promise<any> { return this.dummy({}) }
  async createCoupon(..._args: any[]): Promise<any> { return this.dummy({}) }
  async patchCoupon(..._args: any[]): Promise<any> { return this.dummy({}) }
  async deleteCoupon(..._args: any[]): Promise<any> { return this.dummy({}) }
}
export const couponService = CouponService.getInstance()
