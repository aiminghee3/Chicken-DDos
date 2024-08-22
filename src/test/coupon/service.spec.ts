import { CouponService } from '../../coupon/service/coupon.service';
import { RedisService } from '../../redis/service/redis.service';
import { Lock } from 'redlock';
import { Test, TestingModule } from '@nestjs/testing';
import { Coupon } from '../../coupon/entity/coupon.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { type MockProxy, mock } from "jest-mock-extended";
import { CouponWallet } from '../../coupon/entity/coupon-wallet.entity';
import { Repository } from 'typeorm';

describe('CouponService', () =>{

  let couponService : CouponService;
  let redisService : MockProxy<RedisService>;
  //let couponWalletRepository : jest.Mocked<Repository<CouponWallet>>;
  let mockLock : MockProxy<Lock>;


  const mockCoupon : Coupon = new Coupon("A001", 100, 100, 100);
  const mockWallet : CouponWallet = new CouponWallet("1234", mockCoupon);
  const applyUser = {
    userId : "1234",
    code : "A001",
  }

  const mockRepository = {
    create : jest.fn(),
    save : jest.fn(),
    manager:{
      transaction : jest.fn(),
    }
  }

  beforeEach(async () =>{
    redisService = mock<RedisService>();
    mockLock = mock<Lock>();

    const module : TestingModule = await Test.createTestingModule({
      providers:[
        CouponService,
        {
          provide: getRepositoryToken(Coupon),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(CouponWallet),
          useValue:{
          }
        },
        {
          provide: RedisService,
          useValue: redisService
        }
      ]
    }).compile();

    couponService = module.get<CouponService>(CouponService);
  })


  it('성공 - 의존성 주입 로직 모킹', async() =>{
    expect(couponService).toBeDefined();
    //expect(couponWalletRepository).toBeDefined();
    expect(redisService).toBeDefined();
    expect(mockLock).toBeDefined();
  })


  it('성공 - 쿠폰발급(분산락 사용)', async() =>{
    //given
    redisService.acquireLock.mockResolvedValueOnce(mockLock); // 모킹 락 획득

    const transactionManager = {
      findOne : jest.fn().mockResolvedValueOnce(mockCoupon),
      save : jest.fn().mockResolvedValueOnce(mockWallet)
    }

    mockRepository.manager.transaction.mockImplementation(async (callback) => {
      await callback(transactionManager);
    });

    jest.spyOn(couponService, 'checkAlreadyIssuedCoupon').mockResolvedValueOnce(undefined);
    jest.spyOn(couponService, 'updateCouponAmount').mockResolvedValueOnce(mockCoupon);
    mockCoupon.leftAmount -= 1;

    mockLock.release.mockResolvedValueOnce(undefined);

    //when
    const result = await couponService.issueCouponRedisLock(applyUser);

    //then
    expect(result).toEqual(mockWallet)
    expect(redisService.acquireLock).toHaveBeenCalledWith(`coupon:${applyUser.code}`);
    expect(couponService.checkAlreadyIssuedCoupon).toHaveBeenCalledWith("1234", mockCoupon, transactionManager);
    expect(couponService.updateCouponAmount).toHaveBeenCalledWith(mockCoupon, transactionManager)
    expect(mockLock.release).toHaveBeenCalled();
  })

})