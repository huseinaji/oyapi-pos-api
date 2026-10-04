import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../../../common/decorator/decorator';
import { CacheService } from '../../../../infrastructure/redis-provider/redis-cache.service';
import { RedisSessionData } from '../../utils/auth.type';

@Injectable()
export class AuthGuard implements CanActivate {
  private logger = new Logger(AuthGuard.name);
  constructor(
    private reflector: Reflector,
    private cacheService: CacheService,
  ) { }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const req = context.switchToHttp().getRequest<FastifyRequest>();

    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]
    );

    this.logger.debug(`${req.method}:${req.originalUrl}`);

    const session = req.session;

    if (isPublic) return true;

    if (!session.sessionId || !session.payload) {
      throw new UnauthorizedException();
    }

    const redisSessionData: RedisSessionData | null = await this.cacheService.get<RedisSessionData>(`user:${session.payload.userPayload?.sub}:session`);

    if (!redisSessionData) throw new UnauthorizedException();

    if (session.sessionId !== redisSessionData.sessionId) {
      throw new UnauthorizedException()
    }

    if (session.payload?.rememberMe) {
      session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
    }

    req['user'] = session.payload;

    return true;
  }
}
