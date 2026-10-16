import { BadRequestException, Injectable } from '@nestjs/common';
import { UserAuthPayload } from '../../auth/utils/auth.type';
import { CreatePOSTransactionDto } from '../dto/create-transaction.dto';
import { SalesInvoiceService } from './sales-invoice.service';
import { Sequelize } from 'sequelize-typescript';
import { SalesInvoiceItemService } from './sales-invoice-item.service';
import { SalesInvoiceItem } from '../entities/sales-invoice-item.entity';
import { PosSessionEntryService } from './pos-session-entry.service';
import { ItemService } from '../../inventory/services/item.service';
import { Item } from '../../inventory/entities/item.entity';
import { PosSessionEntryItem } from '../entities/pos-session-entry-item.entity';
import { PosSessionEntry } from '../entities/pos-session-entry.entity';

@Injectable()
export class PointOfsaleService {
  constructor(
    private readonly salesInvoiceService: SalesInvoiceService,
    private readonly salesInvoiceItemService: SalesInvoiceItemService,
    private readonly posSessionEntryService: PosSessionEntryService,
    private readonly itemService: ItemService,
    private sequelize: Sequelize,
  ) { }

  calculateTotalAmount(items: SalesInvoiceItem[]): number {
    const amountMap = items.map((item) => item.amount);
    return amountMap.reduce((acc, currVal) => acc + currVal, 0);
  }

  async createTransaction(
    data: CreatePOSTransactionDto,
    user: UserAuthPayload,
  ) {
    const { items, ...dto } = data;

    return this.sequelize.transaction(async (t) => {
      const tx = { transaction: t };
      const invoice = await this.salesInvoiceService.create(
        {
          createDto: {
            ...dto,
          },
          user,
        },
        tx,
      );

      const currentSession = await this.posSessionEntryService.getSessionByStore(data.storeId);

      if (!currentSession) throw new BadRequestException('There is no session available');

      const invoiceItems = await this.salesInvoiceItemService.generateFromSI(
        invoice.id,
        items,
        data.posSessionId,
        tx,
      );

      invoice.totalAmount = this.calculateTotalAmount(invoiceItems);
      await invoice.save(tx);

      return invoice;
    });
  }

  async findAllSellableItem(posSession: PosSessionEntry) {
    //check store session
    // ambil semua store session item
    // untuk item finished good, ambil semua item finished good dan item component
    // map dengan store session
    // ambil finished good yang opening qty ada di store session
    const storeSessionItem = posSession.items;

    const items = await this.itemService.findAllSellableItem();

    const result = this.mapSessionItemWithInventoryItem(storeSessionItem, items);

    return result;
  }

  private mapSessionItemWithInventoryItem(
    sessionItems: PosSessionEntryItem[],
    items: Item[],
  ) {
    const sessionItemMap = new Map(
      sessionItems.map((sessionItem) => [
        sessionItem.itemId,
        sessionItem
      ]),
    );

    const result = items
      .filter((item) => item.type !== 'raw_material')
      .map((item) => {
        item = item.get({ plain: true });
        // Priority 1: use stock directly recorded in POS session.
        const sessionItem = sessionItemMap.get(item.id);

        if (sessionItem) {
          const availableQty =
            sessionItem.openingQty -
            sessionItem.soldQty

          return {
            ...item,
            availableQty,
          };
        }

        // Priority 2: calculate bundle stock from its components.
        if (item.type === 'item_bundle') {
          const components = item.itemComponents ?? [];

          if (components.length === 0) {
            return {
              ...item,
              availableQty: 0,
            };
          }

          const availableQty = Math.min(
            ...components.map((component) => {
              const componentSessionItem = sessionItemMap.get(
                component.componentItemId,
              );

              const componentQty = Number(component.qty);

              if (!componentSessionItem || componentQty <= 0) {
                return 0;
              }

              const componentAvailableQty = Math.max(
                0,
                Number(componentSessionItem.openingQty) -
                Number(componentSessionItem.soldQty),
              );

              return Math.floor(
                componentAvailableQty / componentQty,
              );
            }),
          );

          return {
            ...item,
            availableQty,
          };
        }

        // No session stock available for this item.
        return {
          ...item,
          availableQty: 0,
        };
      });

    console.log(result);
    return result;
  }

  async findByInvoice(invoiceId: string, user: UserAuthPayload) {
    await this.salesInvoiceService.findOne({ id: invoiceId, user });
  }

  async removeTransaction(siId: string, user: UserAuthPayload) {
    return this.sequelize.transaction(async (t) => {
      const tx = { transaction: t };

      const invoice = await this.salesInvoiceService.findOne({ id: siId }, tx);

      invoice.deletedAt = Date.now();
      invoice.updatedBy = user.sub;
      await invoice.save(tx);
    });
  }
}
