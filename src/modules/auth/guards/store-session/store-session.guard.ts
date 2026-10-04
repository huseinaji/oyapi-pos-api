import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { IS_SESSION_FREE_KEY } from '../../../../common/decorator/decorator';

@Injectable()
export class StoreSessionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
  ) { }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();

    const isSessionFree = this.reflector.getAllAndOverride<boolean>(
      IS_SESSION_FREE_KEY, [context.getHandler(), context.getClass()]
    );

    if (isSessionFree) return true;

    const storeSession = req.session.payload.userPayload.store;

    if (!storeSession) {
      throw new UnauthorizedException('You have to select store');
    }

    req.storeSession = storeSession;

    return true;
  }
}
