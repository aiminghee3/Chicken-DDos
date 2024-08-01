import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Coupon } from "../entity/coupon.entity";
import { EntityManager, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { CouponWallet } from "../entity/coupon-wallet.entity";
import { IssueCouponDto } from "../dto/coupon.dto";

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    @InjectRepository(CouponWallet)
    private readonly couponWalletRepository: Repository<CouponWallet>

  ){}

  async issueCoupon(body : IssueCouponDto) : Promise<CouponWallet>{
    try {
      let issuedCoupon : CouponWallet;

      await this.couponRepository.manager.transaction(async (transaction: EntityManager) =>{

        const coupon: Coupon = await transaction.findOne(
          Coupon, {where : {code: body.code}, lock: { mode: 'pessimistic_write' }}
        )

        if(!coupon){
          throw new NotFoundException("존재하지 않는 쿠폰입니다.")
        }
        await this.checkAlreadyIssuedCoupon(body.userId, coupon, transaction);

        const updatedCoupon = await this.updateCouponAmount(coupon, transaction);
        const wallet = new CouponWallet(body.userId, updatedCoupon);

        issuedCoupon = await transaction.save(CouponWallet, wallet);
      })
      return issuedCoupon;
    }
    catch(error){
      throw error;
    }
  }

  async checkAlreadyIssuedCoupon(userId : string, coupon : Coupon, transaction : EntityManager){
    const haveCouponUser = await transaction.findOne(CouponWallet, {where : {userId : userId}})
    if(!haveCouponUser){
      return;
    }
    else if(JSON.stringify(haveCouponUser.coupon) !== JSON.stringify(coupon)){
      throw new BadRequestException('이미 쿠폰을 발급받은 유저입니다.');
    }
  }

  async updateCouponAmount(coupon : Coupon, transaction : EntityManager) : Promise<Coupon>{
    if(coupon.leftAmount <= 0){
      throw new Error('쿠폰 수량이 모두 소진되었습니다.')
    }
    coupon.leftAmount--;
    const updatedCoupon : Coupon = await transaction.save(Coupon, coupon);
    return updatedCoupon;
  }


  async resetCoupon(){
    try{

      await this.couponRepository.createQueryBuilder()
        .delete()
        .from(Coupon)
        .execute();

      const couponA : Coupon = new Coupon('A001', 100, 100, 100);
      const couponB : Coupon = new Coupon('B001', 50, 500, 500);
      const couponC : Coupon = new Coupon('C001', 10, 1000, 1000);

      await this.couponRepository.save(couponA);
      await this.couponRepository.save(couponB);
      await this.couponRepository.save(couponC);

      return '쿠폰 세팅 완료;'
    }
    catch(error){
      return error;
    }
  }

}
