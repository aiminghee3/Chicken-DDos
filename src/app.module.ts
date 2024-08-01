import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CouponModule } from './coupon/coupon.module';
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql', // 사용하는 데이터베이스 유형
      host: 'localhost', // 데이터베이스 호스트
      port: 3306, // 데이터베이스 포트
      username: 'test_server', // 데이터베이스 유저 이름
      password: '00000000', // 데이터베이스 비밀번호
      database: 'couponDB', // 데이터베이스 이름
      entities: [__dirname + '/**/*.entity{.ts,.js}'], // 엔티티 파일 위치
      synchronize: true, // 개발 목적으로만 사용, 프로덕션에서는 사용하지 마세요
    }),
    CouponModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
