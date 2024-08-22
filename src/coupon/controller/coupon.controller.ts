import { Body, Controller, Get, Post } from '@nestjs/common';
import { CouponService } from "../service/coupon.service";
import { IssueCouponDto } from "../dto/coupon.dto";
import { CouponWallet } from "../entity/coupon-wallet.entity";
import { Coupon } from '../entity/coupon.entity';

@Controller('coupons')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post('issue')
  async issueCoupon(@Body() body : IssueCouponDto) : Promise<CouponWallet>{
    return await this.couponService.issueCouponRedisLock(body);
    //return await this.couponService.issueCouponPessimisticLock(body);
  }

  @Post()
  async resetCoupon(){
    return await this.couponService.resetCoupon();
  }

  @Get()
  async getLeftCouponList() : Promise<Coupon[]>{
    return await this.couponService.getCouponList();
  }
}
