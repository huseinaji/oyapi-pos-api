import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { StoreService } from '../../store.service';
import { Reflector } from '@nestjs/core';
import { STORE_ACCESS_KEY, StoreAccessOptions } from '../../utils/decorators/store.decorator';
import { UserRole } from '../../../user/utils/user.types';

@Injectable()
export class StoreAcessRoleGuard implements CanActivate {
  constructor(
    private storeService: StoreService,
    private reflector: Reflector
  ) { }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const access =
      this.reflector.getAllAndOverride<StoreAccessOptions>(
        STORE_ACCESS_KEY,
        [
          context.getHandler(),
          context.getClass(),
        ],
      ) ?? {};

    const user = req.user.userPayload;

    const storeId = req.params.id;

    // admin bypass
    if (user.role === UserRole.ADMIN) return true;

    const storeMember = await this.storeService.getMemberData(storeId, user.sub);

    if (!storeMember) {
      throw new ForbiddenException(
        'You are not a member of this store',
      );
    }

    // Tidak ada restriction:
    // semua member boleh
    if (
      !access.roles?.length &&
      !access.isOwner
    ) {
      return true;
    }

    const hasRole = access.roles?.includes(storeMember.role) ?? false;

    const isOwner =
      access.isOwner === true &&
      user.sub === storeMember.userId;

    // Authorization menggunakan OR
    if (hasRole || isOwner) return true;

    throw new ForbiddenException(
      'You are not authorized to perform this action',
    );
  }
}
