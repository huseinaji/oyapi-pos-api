import { Module } from '@nestjs/common';
import { CacheAdapterService } from './cache-adapter.service';
import { RedisModule } from '@nestjs-modules/ioredis';
import { GET_ENV_VARIABLE } from '../../common/utils/utils';

@Module({
  imports: [
    RedisModule.forRoot({
      type: 'single',
      url: GET_ENV_VARIABLE('REDIS_HOST', 'localhost:6379'),
    }),
  ],
  providers: [CacheAdapterService],
  exports: [CacheAdapterService],
})
export class CacheAdapterModule { }
