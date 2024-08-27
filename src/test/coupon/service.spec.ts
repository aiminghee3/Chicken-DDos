import { CouponService } from '../../coupon/service/coupon.service';
import { RedisService } from '../../redis/service/redis.service';
import { Lock } from 'redlock';
import { Test, TestingModule } from '@nestjs/testing';
import { Coupon } from '../../coupon/entity/coupon.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { type MockProxy, mock } from "jest-mock-extended";
import { CouponWallet } from '../../coupon/entity/coupon-wallet.entity';

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
          useValue:{}
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

  it('실패 - 이미 쿠폰을 받급받은 유저인 경우', async() =>{
    //given
    redisService.acquireLock.mockResolvedValueOnce(mockLock);

    const issuedCouponWallet = new CouponWallet("1234", mockCoupon);

    const transactionManager = {
      findOne :
        jest
          .fn()
          .mockResolvedValueOnce(mockCoupon)
          .mockResolvedValueOnce(issuedCouponWallet.coupon),
    }
    mockRepository.manager.transaction.mockImplementation(async (callback)=>{
      await callback(transactionManager);
    })

    //when, then
    await expect(couponService.issueCouponRedisLock(applyUser)).rejects.toThrowError('이미 쿠폰을 발급받은 유저입니다.');
    expect(mockLock.release).toHaveBeenCalled();
  })


  it('실패 - 쿠폰이 없는 경우', async() =>{
    //given
    redisService.acquireLock.mockResolvedValueOnce(mockLock);
    mockCoupon.leftAmount = 0;

    const transactionManager = {
      findOne : jest.fn().mockResolvedValueOnce(mockCoupon),
    }

    mockRepository.manager.transaction.mockImplementation(async (callback) =>{
      await callback(transactionManager);
    })

    jest.spyOn(couponService, 'checkAlreadyIssuedCoupon').mockResolvedValueOnce(undefined);

    //when, then
    await expect(couponService.issueCouponRedisLock(applyUser)).rejects.toThrowError('쿠폰 수량이 모두 소진되었습니다.');
    expect(mockLock.release).toHaveBeenCalled();
  })
})