import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../../user/utils/user.types';
import { ROLES_KEY } from '../../../../common/decorator/decorator';
import { type FastifyRequest } from 'fastify';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const req: FastifyRequest = context.switchToHttp().getRequest();

    return requiredRoles.some((role) => req.user.userPayload.role.includes(role));
  }
}
