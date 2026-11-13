import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';

@Injectable()
export class StoreContextGuard implements CanActivate {
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const req: FastifyRequest = context.switchToHttp().getRequest();
    const { id } = req.params as { id: string };

    if (req.storeSession.storeId !== id) {
      throw new BadRequestException('Invalid Store id');
    }

    return true;
  }
}
