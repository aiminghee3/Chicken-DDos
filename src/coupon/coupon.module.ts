import { Module } from '@nestjs/common';
import { CouponController } from './controller/coupon.controller';
import { CouponService } from './service/coupon.service';
import { TypeOrmModule } from "@nestjs/typeorm";
import { Coupon } from "./entity/coupon.entity";
import { CouponWallet } from "./entity/coupon-wallet.entity";
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [TypeOrmModule.forFeature([Coupon, CouponWallet]), RedisModule],
  controllers: [CouponController],
  providers: [CouponService]
})
export class CouponModule {}
