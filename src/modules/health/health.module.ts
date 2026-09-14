import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.controller';
import { TerminusLogger } from './terminus-logger.service';

@Module({
  imports: [
    TerminusModule, 
    HttpModule,
    TerminusModule.forRoot({
      logger: TerminusLogger,
    }),
  ],
  controllers: [HealthController],
})
export class HealthModule {}