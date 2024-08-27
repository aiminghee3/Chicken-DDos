import { CouponController } from '../../coupon/controller/coupon.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { CouponService } from '../../coupon/service/coupon.service';
import { IssueCouponDto } from '../../coupon/dto/coupon.dto';
import { CouponWallet } from '../../coupon/entity/coupon-wallet.entity';
import { Coupon } from '../../coupon/entity/coupon.entity';

describe('couponController', () =>{
  let couponController: CouponController;

  const mockCouponService = {
    issueCouponRedisLock : jest.fn(),
  }


  beforeEach(async () =>{
    const module: TestingModule = await Test.createTestingModule({
      controllers:[CouponController],
      providers:[
        {
          provide: CouponService,
          useValue: mockCouponService,
        }
      ],
    }).compile();
    couponController = module.get<CouponController>(CouponController);
  })

  it('성공 - 쿠폰발급', async() =>{
    //given
    const couponDto : IssueCouponDto = {userId : '1234', code : 'A001'}
    const mockCoupon : Coupon = new Coupon("A001", 100, 100, 100);
    const mockWallet : CouponWallet = new CouponWallet("1234", mockCoupon);

    mockCouponService.issueCouponRedisLock.mockResolvedValueOnce(mockWallet)

    //when
    const issuedCoupon = await couponController.issueCoupon(couponDto);

    //then
    expect(issuedCoupon).toEqual(mockWallet);
    expect(mockCouponService.issueCouponRedisLock).toHaveBeenCalled();
  })
})