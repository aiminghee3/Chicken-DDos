import { Body, Controller, Post } from "@nestjs/common";
import { CouponService } from "../service/coupon.service";
import { IssueCouponDto } from "../dto/coupon.dto";
import { CouponWallet } from "../entity/coupon-wallet.entity";

@Controller('coupons')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post('issue')
  async issueCoupon(@Body() body : IssueCouponDto) : Promise<CouponWallet>{
    return await this.couponService.issueCoupon(body);
  }

  @Post()
  async resetCoupon(){
    return await this.couponService.resetCoupon();
  }

}
