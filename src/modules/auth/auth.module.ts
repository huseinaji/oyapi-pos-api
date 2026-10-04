import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/session/auth.guard';
import { RedisProviderModule } from '../../infrastructure/redis-provider/redis-provider.module';
import { RolesGuard } from './guards/role/role.guard';
import { StoreSessionGuard } from './guards/store-session/store-session.guard';

@Module({
  imports: [
    UserModule,
    RedisProviderModule,
  ],
  controllers: [AuthController],
  providers: [AuthService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: StoreSessionGuard,
    },
  ],
  exports: [AuthService],
})
export class AuthModule { }
