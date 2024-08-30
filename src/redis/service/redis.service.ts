import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Client from "ioredis";
import Redis from 'ioredis';
import Redlock, { Lock } from 'redlock';

@Injectable()
export class RedisService{
  private readonly redlock: Redlock;
  private readonly lockDuration = 5000;

  constructor(@InjectRedis() private redis: Redis) {
    const redisA = new Client({ host: "localhost", port: 7001 });
    const redisB = new Client({ host: "localhost", port: 7002 });
    const redisC = new Client({ host: "localhost", port: 7003 });

    this.redlock = new Redlock([redisA, redisB, redisC], {
      retryCount: 10, // 에러 전까지 재시도 최대 횟수
      retryDelay: 200, // 각 시도간의 간격
      retryJitter: 200, // 재시도 시 더해지는 최대 시간
      automaticExtensionThreshold: 500, // 잠금 연장 전 남아야되는 최소 시간
    });
  }


  // SETNX를 사용하여 락 획득
  async acquireLock(key: string, value: string): Promise<boolean> {
    const result = await this.redis.set(key, value, 'PX', this.lockDuration, 'NX');
    return result === 'OK'; // 락 획득 성공 여부 반환
  }

  // 락 해제 메서드
  async releaseLock(key: string, value: string): Promise<boolean> {
    const luaScript = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    const result = await this.redis.eval(luaScript, 1, key, value);
    return result === 1; // 락 해제 성공 여부 반환
  }

  // 기존 setNx 메서드 (원래 락을 획득하기 위해 사용될 수도 있음)
  async setNx(key: string, value: string) {
    return this.redis.set(key, value, 'PX', 3000, 'NX');
  }

  // 키 삭제
  async del(key: string) {
    return this.redis.del(key);
  }
}
