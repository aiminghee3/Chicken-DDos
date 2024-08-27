import { Injectable } from '@nestjs/common';
import { Coupon } from "../entity/coupon.entity";
import { EntityManager, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { CouponWallet } from "../entity/coupon-wallet.entity";
import { IssueCouponDto } from "../dto/coupon.dto";
import { RedisService } from '../../redis/service/redis.service';
import { Lock } from 'redlock';
import { AlreadyIssuedException, BadRequestException, EntityNotFoundException } from '../../common';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    @InjectRepository(CouponWallet)
    private readonly couponWalletRepository: Repository<CouponWallet>,
    private readonly redisService: RedisService,
  ){}

  async issueCouponRedisLock(body: IssueCouponDto) : Promise<CouponWallet>{
    let issuedCoupon : CouponWallet;
    let lock: Lock = await this.redisService.acquireLock(`coupon:${body.code}`);

      try{
        await this.couponRepository.manager.transaction(async (transaction: EntityManager) =>{

          const coupon: Coupon = await transaction.findOne(
            Coupon, {where : {code: body.code}}
          )

          if(!coupon){
            throw EntityNotFoundException("존재하지 않는 쿠폰입니다.")
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
      }finally{
        if(lock){
          await lock.release();
        }
      }
  }

  async issueCouponPessimisticLock(body : IssueCouponDto) : Promise<CouponWallet>{
    try {
      let issuedCoupon : CouponWallet;

      await this.couponRepository.manager.transaction(async (transaction: EntityManager) =>{

        const coupon: Coupon = await transaction.findOne(
          Coupon, {where : {code: body.code}, lock: { mode: 'pessimistic_write' }}
        )

        if(!coupon){
           throw EntityNotFoundException("존재하지 않는 쿠폰입니다.")
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

  async getCouponList() : Promise<Coupon[]>{
    return await this.couponRepository.find();
  }


  async checkAlreadyIssuedCoupon(userId : string, coupon : Coupon, transaction : EntityManager){
    const checkUserHaveCoupon = await transaction.findOne(CouponWallet, {where : {userId : userId}})
    if(!checkUserHaveCoupon){
      return;
    }
    else if(JSON.stringify(checkUserHaveCoupon.coupon) !== JSON.stringify(coupon)){
      throw AlreadyIssuedException('이미 쿠폰을 발급받은 유저입니다.');
    }
  }

  async updateCouponAmount(coupon : Coupon, transaction : EntityManager) : Promise<Coupon>{
    if(coupon.leftAmount <= 0){
      throw BadRequestException('쿠폰 수량이 모두 소진되었습니다.')
    }
    coupon.decreaseLeftAmount();
    const updatedCoupon : Coupon = await transaction.save(Coupon, coupon);
    return updatedCoupon;
  }


  async resetCoupon(){
    try{

      await this.couponRepository.createQueryBuilder()
        .delete()
        .from(Coupon)
        .execute();

      const couponA : Coupon = new Coupon('A001', 100, 300, 300);
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
