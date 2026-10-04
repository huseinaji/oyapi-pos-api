import { Module } from '@nestjs/common';
import { RedisProviderService } from './redis-provider.service';
import { RedisListService } from './redis-list.service';
import { CacheService } from './redis-cache.service';
import { RedisModule } from '@nestjs-modules/ioredis';
import { GET_ENV_VARIABLE } from '../../common/utils';

@Module({
  imports: [
    RedisModule.forRoot({
      type: 'single',
      url: GET_ENV_VARIABLE('REDIS_HOST'),
    }),
  ],
  providers: [RedisProviderService, RedisListService, CacheService],
  exports: [RedisProviderService, RedisListService, CacheService]
})
export class RedisProviderModule { }
