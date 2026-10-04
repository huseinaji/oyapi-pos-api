import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { TerminusLogger } from './terminus-logger.service';
import { RedisProviderModule } from '../../infrastructure/redis-provider/redis-provider.module';

@Module({
  imports: [
    TerminusModule,
    RedisProviderModule,
    TerminusModule.forRoot({
      logger: TerminusLogger,
    }),
  ],
  controllers: [HealthController],
})
export class HealthModule {}