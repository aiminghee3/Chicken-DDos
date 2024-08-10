import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import Redlock, {Lock} from 'redlock';

@Injectable()
export class RedisService{
  private readonly redlock: Redlock;
  private readonly lockDuration = 2000;

  constructor(@InjectRedis() private redis: Redis) {
    this.redlock = new Redlock([redis]);
  }

  async acquireLock(key: string): Promise<Lock> {
    return await this.redlock.acquire([`lock:${key}`], this.lockDuration);
  }

  async setNx(key: string, value: string){
    return this.redis.set(key, value, 'PX', 1000, 'NX');
  }

  async del(key: string){
    return this.redis.del(key);
  }
}
