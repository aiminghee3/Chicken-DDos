import { Module } from '@nestjs/common';
import { RedisModule as NestjsRedisModule } from '@liaoliaots/nestjs-redis';
import { RedisService } from './service/redis.service';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [
    NestjsRedisModule.forRoot({
      config: {
        host: process.env.HOST,
        port: parseInt(process.env.REDIS_PORT, 10),
      },
    }),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}