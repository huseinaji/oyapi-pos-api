import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { FastifyRequest } from 'fastify';

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request =
      context.switchToHttp().getRequest<FastifyRequest>();

    const method = request.method.toUpperCase();

    // Safe methods tidak perlu CSRF validation
    if (
      method === 'GET' ||
      method === 'HEAD' ||
      method === 'OPTIONS'
    ) {
      return true;
    }

    const sessionToken = request.session?.csrfToken;

    const requestToken =
      request.headers['x-csrf-token'];

    if (!sessionToken || !requestToken) {
      throw new ForbiddenException(
        'Invalid CSRF token',
      );
    }

    if (requestToken !== sessionToken) {
      throw new ForbiddenException(
        'Invalid CSRF token',
      );
    }

    return true;
  }
}
