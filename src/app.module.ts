import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CouponModule } from './coupon/coupon.module';
import { TypeOrmModule } from "@nestjs/typeorm";
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.HOST,
      port: parseInt(process.env.PORT, 10),
      username: process.env.USERNAME,
      password: process.env.PASSWORD,
      database: process.env.DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}'], // 엔티티 파일 위치
      synchronize: true, // 개발 목적으로만 사용, 프로덕션에서는 사용하지 마세요
    }),

    CouponModule,
    PrometheusModule.register({
      defaultMetrics: {
        enabled: true,
      },
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
