import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { SalesInvoiceItem } from '../entities/sales-invoice-item.entity';
import { InjectModel } from '@nestjs/sequelize';
import { BaseService, TxOptions } from '../../../common/base/base.service';
import { CreateSalesInvoiceItemDto } from '../dto/create-sales-invoice-item.dto';
import { Item } from '../../inventory/entities/item.entity';
import { ItemService } from '../../inventory/services/item.service';
import {
  PosSessionEntryService,
  PosSessionStockRequirement,
} from './pos-session-entry.service';
import { ItemStatus, ItemType } from '../../inventory/utils/types/item.type';

@Injectable()
export class SalesInvoiceItemService extends BaseService<SalesInvoiceItem> {
  constructor(
    @InjectModel(SalesInvoiceItem)
    protected readonly model: typeof SalesInvoiceItem,
    private readonly itemService: ItemService,
    private readonly posSessionService: PosSessionEntryService,
  ) {
    super(model);
  }

  private calculateItemAmount(data: CreateSalesInvoiceItemDto, item: Item) {
    return data.qty * item.sellingPrice;
  }

  /** Menjumlahkan kebutuhan stok per item agar beberapa baris tidak melewati saldo bersama. */
  private addRequirement(
    requirements: Map<string, PosSessionStockRequirement>,
    itemId: string,
    qty: number,
    validateAvailable: boolean,
  ) {
    const existing = requirements.get(itemId);
    requirements.set(itemId, {
      itemId,
      qty: (existing?.qty ?? 0) + qty,
      validateAvailable: validateAvailable || existing?.validateAvailable === true,
    });
  }

  /** Mengembangkan bundle bertingkat menjadi kebutuhan stok item fisik. */
  private async collectBundleRequirements(
    itemData: Item,
    qty: number,
    requirements: Map<string, PosSessionStockRequirement>,
    options?: TxOptions,
    ancestors = new Set<string>(),
  ) {
    if (itemData.type !== ItemType.ITEM_BUNDLE) {
      if (!itemData.isMaintainStock) return;
      this.addRequirement(
        requirements,
        itemData.id,
        qty,
        itemData.isMaintainStock,
      );
      return;
    }

    if (ancestors.has(itemData.id)) {
      throw new BadRequestException(`Circular item bundle detected for ${itemData.id}`);
    }

    //this.addRequirement(requirements, itemData.id, qty, true);

    const components = itemData.itemComponents ?? [];
    if (!components.length) {
      throw new BadRequestException(`Bundle ${itemData.name} has no components`);
    }

    const nextAncestors = new Set(ancestors).add(itemData.id);
    for (const component of components) {
      if (component.qty <= 0) {
        throw new BadRequestException(
          `Bundle component quantity must be positive for item ${component.componentItemId}`,
        );
      }

      const componentItem = await this.itemService.findOne(
        component.componentItemId,
        options
      );
      if (
        componentItem.storeId !== itemData.storeId ||
        componentItem.status !== ItemStatus.ACTIVE
      ) {
        throw new BadRequestException(
          `Bundle component ${componentItem.name} must be active in the same store`,
        );
      }
      await this.collectBundleRequirements(
        componentItem,
        qty * component.qty,
        requirements,
        options,
        nextAncestors,
      );
    }
  }

  async generateFromSI(
    invoiceId: string,
    items: CreateSalesInvoiceItemDto[],
    sessionId: string,
    options?: TxOptions,
  ) {
    const stockRequirements = new Map<string, PosSessionStockRequirement>();
    const records = await Promise.all(
      items.map(async (item) => {
        const itemData = await this.itemService.findOne(
          item.itemId,
          options
        );

        if (itemData.type === ItemType.RAW_MATERIAL) {
          throw new BadRequestException(
            `Raw material item ${itemData.name} cannot be sell`
          );
        }

        await this.collectBundleRequirements(
          itemData,
          item.qty,
          stockRequirements,
          options,
        );

        const amount = this.calculateItemAmount(item, itemData);
        return { ...item, salesInvoiceId: invoiceId, amount };
      }),
    );

    await this.posSessionService.consumeSessionStock(
      sessionId,
      [...stockRequirements.values()],
      options
    );

    return await this.model.bulkCreate(records, options);
  }
}
