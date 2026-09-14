import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { APP_GUARD } from '@nestjs/core';
import { CacheAdapterModule } from '../../infrastructure/cache-adapter/cache-adapter.module';
import { AuthGuard } from './auth.guard';
import { CsrfService } from './csrf.service';
import { CsrfGuard } from './csrf.guard';

@Module({
  imports: [
    UserModule,
    CacheAdapterModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, CsrfService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CsrfGuard,
    },
  ],
  exports: [AuthService],
})
export class AuthModule { }
