import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { GET_ENV_VARIABLE } from './common/utils';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { PointOfSaleModule } from './modules/point-of-sale/point-of-sale.module';
import { HealthModule } from './modules/health/health.module';
import { DB_CONFIG } from './infrastructure/database/config/database.config';
import { StoreModule } from './modules/store/store.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { RedisProviderModule } from './infrastructure/redis-provider/redis-provider.module';
import { WinstonModule } from 'nest-winston';
import { WinstonConfig } from './common/config/winston.config';
import { HttpExceptionFilter } from './common/utils/http-exception.filter';
import { APP_FILTER } from '@nestjs/core';

@Module({
  imports: [
    SequelizeModule.forRoot({
      ...DB_CONFIG
    }),
    BullModule.forRoot({
      connection: {
        url: GET_ENV_VARIABLE('REDIS_HOST'),
      },
    }),
    WinstonModule.forRoot({
      ...WinstonConfig
    }),
    ScheduleModule.forRoot(),
    UserModule,
    AuthModule,
    PointOfSaleModule,
    HealthModule,
    InventoryModule,
    StoreModule,
    RedisProviderModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter
    }
  ]
})
export class AppModule { }
