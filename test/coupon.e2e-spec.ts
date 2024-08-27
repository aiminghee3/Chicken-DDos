import { CouponController } from '../src/coupon/controller/coupon.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { CouponModule } from '../src/coupon/coupon.module';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

describe('couponController', () =>{
  let coupon: INestApplication;

  beforeEach(async () =>{
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    coupon = moduleFixture.createNestApplication();
    await coupon.init();
  })

  it('/coupons/issue (POST) - 쿠폰 발급', () => {

    return request(coupon.getHttpServer())
      .post('/coupons/issue')
      .send({code : 'A001', userId: '123'})
      .expect(201)
  });

  it('/ (GET) - 쿠폰 리스트 가져오기', () => {
    return request(coupon.getHttpServer())
      .get('/')
      .expect(200)
      .expect((res) =>{
        expect(res.body).toBeInstanceOf(Object);
      })
  })
})