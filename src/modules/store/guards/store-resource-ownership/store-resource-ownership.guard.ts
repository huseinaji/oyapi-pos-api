import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { ItemService } from '../../../inventory/services/item.service';
import { ItemCategoryService } from '../../../inventory/services/item-category.service';
import { SalesInvoiceService } from '../../../point-of-sale/services/sales-invoice.service';
import type { FastifyRequest } from 'fastify';

@Injectable()
export class StoreResourceOwnershipGuard implements CanActivate {
  constructor(
    private itemService: ItemService,
    private itemCategoryService: ItemCategoryService,
    private salesInvoiceService: SalesInvoiceService,
  ) { }

  private async validateItemData(itemId: string, storeId: string) {
    if (!itemId) return null;

    const itemData = await this.itemService.findOne(itemId);
    if (itemData.storeId !== storeId) {
      throw new ForbiddenException('Item does not belong to store')
    }

    return itemData;
  }

  private async validateSIData(salesInvoiceId: string, storeId: string) {
    if (!salesInvoiceId) return null;

    const siData = await this.salesInvoiceService.findOne({ id: salesInvoiceId });

    if (siData.storeId !== storeId) {
      throw new ForbiddenException('Sales Invoice does not belong to store')
    }

    return siData;
  }

  private async validateCategoryData(categoryId: string, storeId: string) {
    if (!categoryId) return null;

    const categoryData = await this.itemCategoryService.findOne({ id: categoryId });
    if (categoryData.storeId !== storeId) {
      throw new ForbiddenException('Item category does not belong to store');
    }

    return categoryData;
  }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const req: FastifyRequest = context.switchToHttp().getRequest();
    const { salesInvoiceId, itemId, categoryId, id } = req.params as any;

    const itemData = await this.validateItemData(itemId, id);
    await this.validateCategoryData(categoryId, id);

    const siData = await this.validateSIData(salesInvoiceId, id);

    if (req.storeSession.storeId !== id) {
      throw new BadRequestException('Invalid Store id')
    }

    req['itemData'] = itemData;
    req['siData'] = siData;

    return true;
  }
}
