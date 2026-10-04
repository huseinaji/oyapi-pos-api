import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ItemBundleComponentService } from '../../services/item-bundle-component.service';
import type { FastifyRequest } from 'fastify';

@Injectable()
export class ItemResourceOwnershipGuard implements CanActivate {
  constructor(private itemBundleComponentService: ItemBundleComponentService) {}

  private async validateItemComponentData(
    itemComponentId: string,
    itemId: string,
  ) {
    if (!itemComponentId) return null;

    const componentItem =
      await this.itemBundleComponentService.findOne(itemComponentId);
      
    if (componentItem.itemId !== itemId) {
      throw new ForbiddenException('Item component does not belong to item');
    }

    return componentItem;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: FastifyRequest = context.switchToHttp().getRequest();
    const { itemId, componentId } = req.params as any;

    await this.validateItemComponentData(componentId, itemId);

    return true;
  }
}
