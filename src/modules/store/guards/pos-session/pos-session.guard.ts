import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { PosSessionEntryService } from '../../../point-of-sale/services/pos-session-entry.service';
import type { FastifyRequest } from 'fastify';

@Injectable()
export class PosSessionGuard implements CanActivate {
  constructor(private posSessionEntryService: PosSessionEntryService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: FastifyRequest = context.switchToHttp().getRequest();

    const posSessionData = await this.posSessionEntryService.getSessionByStore(
      req.storeSession.storeId,
    );

    if (!posSessionData) {
      throw new BadRequestException(
        'Threre is no pos session opened. You need to open the pos first',
      );
    }

    req.posSession = posSessionData.get({ plain: true });

    return true;
  }
}
