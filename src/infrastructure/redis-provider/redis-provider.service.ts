import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisProviderService {
  constructor(
    @InjectRedis() private readonly redisClient: Redis,
  ) { }

  getClient(): Redis {
    return this.redisClient;
  }

  duplicate(): Redis {
    const client = this.redisClient.duplicate();

    console.log(
      'DUPLICATE',
      client === this.redisClient,
    );

    return client;
  }
}

