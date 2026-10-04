import {
  Controller,
  Get,
  HttpException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  DiskHealthIndicator,
  MemoryHealthIndicator,
  HealthIndicatorService,
} from '@nestjs/terminus';
import { Public } from '../../common/decorator/decorator';
import { SessionFree } from '../../common/decorator/decorator';
import { RedisProviderService } from '../../infrastructure/redis-provider/redis-provider.service';
import { Sequelize } from 'sequelize-typescript';

@SessionFree()
@Controller('health')
export class HealthController implements OnModuleInit {
  private logger = new Logger(HealthController.name);
  constructor(
    private health: HealthCheckService,
    private readonly healthIndicator: HealthIndicatorService,
    private readonly sequelize: Sequelize,
    private readonly disk: DiskHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly redis: RedisProviderService,
  ) {}

  async onModuleInit() {
    this.logger.log('Running startup health checks');

    try {
      const result = await this.runHealthChecks();
      if (result.status !== 'ok') {
        this.logger.error(
          `Startup health checks failed: ${JSON.stringify(result.error)}`,
        );
        return;
      }

      const statuses = Object.entries(result.details)
        .map(([name, detail]) => `${name}=${detail.status}`)
        .join(', ');
      this.logger.log(`Startup health checks passed: ${statuses}`);
    } catch (error) {
      const response = error instanceof HttpException
        ? error.getResponse()
        : error instanceof Error
          ? error.message
          : 'Unknown health check error';
      this.logger.error(
        `Startup health checks failed: ${JSON.stringify(response)}`,
      );
    }
  }

  @Public()
  @Get()
  @HealthCheck()
  check() {
    return this.runHealthChecks();
  }

  private runHealthChecks() {
    return this.health.check([
      async () => {
        const database = this.healthIndicator.check('database');
        try {
          await this.sequelize.authenticate();
          return database.up();
        } catch {
          return database.down({ message: 'Database health check failed' });
        }
      },
      async () => {
        const redis = this.healthIndicator.check('redis');
        try {
          const response = await this.redis.getClient().ping();
          if (response !== 'PONG') {
            return redis.down({ message: 'Redis ping returned an unexpected response' });
          }
          return redis.up();
        } catch {
          return redis.down({ message: 'Redis health check failed' });
        }
      },
      () =>
        this.disk.checkStorage('storage', {
          path: process.platform === 'win32' ? 'C:\\' : '/',
          thresholdPercent: 0.95,
        }),
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 512 * 1024 * 1024),
    ]);
  }
}
