import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { GET_ENV_VARIABLE } from './common/utils/utils';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { PointOfSaleModule } from './modules/point-of-sale/point-of-sale.module';
import { HealthModule } from './modules/health/health.module';
import { CacheAdapterModule } from './infrastructure/cache-adapter/cache-adapter.module';
import { DB_CONFIG } from './infrastructure/database/config/database.config';
import { StoreModule } from './modules/store/store.module';
import { InventoryModule } from './modules/inventory/inventory.module';

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
    ScheduleModule.forRoot(),
    UserModule,
    AuthModule,
    PointOfSaleModule,
    HealthModule,
    CacheAdapterModule,
    InventoryModule,
    StoreModule,
  ],
})
export class AppModule { }
