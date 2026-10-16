import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PosSessionEntry } from '../entities/pos-session-entry.entity';
import { PosSessionEntryStatus } from '../utils/pos.type';
import { CreatePosSessionEntryItemDto } from '../dto/create-pos-session-entry-item.dto';
import { PosSessionEntryItem } from '../entities/pos-session-entry-item.entity';
import { Sequelize } from 'sequelize-typescript';
import { TxOptions } from '../../../common/base/base.service';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { QueryPosSessionEntryDto } from '../dto/query-pos-session-entry.dto';
import { ItemService } from '../../inventory/services/item.service';
import { HandleSequelizeErrors } from '../../../common/decorator/db-err-handler';
import { GET_STORE_INCLUDE } from '../../store/utils/store.include';
import { GET_POSSESSION_ENTRY_ITEM_INCLUDE } from '../utils/pos-session-entry-item.include';
import { BinService } from '../../inventory/services/bin.service';
import { Item } from '../../inventory/entities/item.entity';
import { ItemStatus, ItemType } from '../../inventory/utils/types/item.type';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GET_ENV_VARIABLE } from '../../../common/utils';
import { GET_USER_INCLUDE } from '../../user/utils/user.include';

export type PosSessionStockRequirement = {
  itemId: string;
  qty: number;
  validateAvailable: boolean;
};

@Injectable()
export class PosSessionEntryService {
  private logger = new Logger(PosSessionEntryService.name);
  constructor(
    @InjectModel(PosSessionEntry) private model: typeof PosSessionEntry,
    @InjectModel(PosSessionEntryItem)
    private readonly posSessionEntryItemModel: typeof PosSessionEntryItem,
    private readonly itemService: ItemService,
    private readonly binService: BinService,
    private readonly sequelize: Sequelize,
  ) { }

  async getSessionByStore(storeId: string, options?: TxOptions) {
    return await this.model.findOne({
      where: {
        status: PosSessionEntryStatus.ACTIVE,
        storeId,
      },
      include: [
        GET_POSSESSION_ENTRY_ITEM_INCLUDE(),
      ],
      ...options,
    });
  }

  /** Memvalidasi dan mencatat konsumsi stok session dengan row lock dalam transaksi. */
  async consumeSessionStock(
    sessionId: string,
    requirements: PosSessionStockRequirement[],
    options?: TxOptions,
  ) {
    const orderedRequirements = [...requirements].sort((a, b) =>
      a.itemId.localeCompare(b.itemId),
    );

    for (const requirement of orderedRequirements) {
      const sessionItem = await this.posSessionEntryItemModel.findOne({
        where: {
          posSessionId: sessionId,
          itemId: requirement.itemId,
        },
        ...options,
        lock: options?.transaction.LOCK.UPDATE,
      });

      if (!sessionItem) {
        throw new BadRequestException(
          `Item ${requirement.itemId} is not tracked by this POS session`,
        );
      }

      const availableQty = sessionItem.openingQty - sessionItem.soldQty;

      if (requirement.validateAvailable && requirement.qty > availableQty) {
        const itemData = await this.itemService.findOne(requirement.itemId);
        throw new ConflictException(
          `Insufficient POS session stock for item ${itemData.name}. Available: ${availableQty}, required: ${requirement.qty}`,
        );
      }

      await sessionItem.increment('soldQty', { by: requirement.qty, ...options });
    }
  }

  private async getBundleOpeningStock(
    item: Item,
    openingStocks: Map<string, number>,
    options: TxOptions,
    ancestors = new Set<string>(),
  ): Promise<number> {
    if (ancestors.has(item.id)) {
      throw new BadRequestException(`Circular item bundle detected for ${item.id}`);
    }

    const bundle = await this.itemService.findOne(item.id, options);
    const components = bundle.itemComponents ?? [];
    if (!components.length) return 0;

    const nextAncestors = new Set(ancestors).add(item.id);
    const availableBundleCounts = await Promise.all(
      components.map(async (component) => {
        if (component.qty <= 0) {
          throw new BadRequestException(
            `Bundle component quantity must be positive for item ${component.componentItemId}`,
          );
        }

        const componentItem = await this.itemService.findOne(
          component.componentItemId,
          options,
        );
        if (
          componentItem.storeId !== bundle.storeId ||
          componentItem.status !== ItemStatus.ACTIVE
        ) {
          return 0;
        }

        const componentOpeningStock =
          componentItem.type === ItemType.ITEM_BUNDLE
            ? await this.getBundleOpeningStock(
              componentItem,
              openingStocks,
              options,
              nextAncestors,
            )
            : openingStocks.get(componentItem.id) ?? 0;

        return Math.floor(componentOpeningStock / component.qty);
      }),
    );

    return Math.min(...availableBundleCounts);
  }

  /** 
   * opening entry input validation 
   * return openingstock items
   * */
  async validateOpeningEntryItems(
    items: CreatePosSessionEntryItemDto[],
    availableItems: Item[],
  ): Promise<Map<string, number>> {
    const requestedOpeningStocks = new Map<string, number>();

    const availableItemIds = new Set(availableItems.map((item) => item.id));
    for (const entry of items ?? []) {
      const itemData = await this.itemService.findOne(entry.itemId);
      if (!availableItemIds.has(entry.itemId)) {
        throw new BadRequestException(
          `Item '${itemData.name}' is not available for pos session entry`,
        );
      }
      if (requestedOpeningStocks.has(entry.itemId)) {
        throw new BadRequestException(
          `Duplicate opening stock entry for item '${itemData.name}'`,
        );
      }
      if (!Number.isInteger(entry.openingQty) || entry.openingQty < 0) {
        throw new BadRequestException(
          `Opening stock must be a non-negative integer for item '${itemData.name}'`,
        );
      }
      requestedOpeningStocks.set(entry.itemId, entry.openingQty);
    }

    return requestedOpeningStocks;
  }

  @HandleSequelizeErrors()
  async create(storeId: string, creator: string, items: CreatePosSessionEntryItemDto[]) {
    return this.sequelize.transaction(async (t) => {
      const tx = { transaction: t };

      const activeSession = await this.getSessionByStore(storeId, tx);
      if (activeSession) {
        throw new ConflictException('A POS session is already open for this store');
      }

      const availableItems = await this.itemService.getPosSessionAvailableItem(
        storeId,
        tx,
      );

      const requestedOpeningStocks = await this.validateOpeningEntryItems(items, availableItems);

      const entity = await this.model.create(
        {
          storeId,
          createdBy: creator,
        },
        tx,
      );

      const openingStocks = new Map<string, number>();
      for (const item of availableItems) {
        const openingQty = requestedOpeningStocks.has(item.id)
          ? requestedOpeningStocks.get(item.id)!
          : item.bin?.actualQty ?? 0;

        if (openingQty > item.bin.actualQty) throw new ConflictException(`Insufficient stock for item '${item.name}'`);
        await this.binService.updateReservedQty(item.id, openingQty, tx);

        openingStocks.set(item.id, openingQty);
      }

      const itemRecords = await Promise.all(
        availableItems.map(async (item) => ({
          itemId: item.id,
          openingQty: openingStocks.get(item.id) ?? 0,
          soldQty: 0,
          posSessionId: entity.id,
        })),
      );

      if (itemRecords?.length) {
        await this.posSessionEntryItemModel.bulkCreate(itemRecords, tx);
      }

      return entity;
    });
  }

  findAndCountAll(query: QueryPosSessionEntryDto, pagination?: PaginationDto) {
    return this.model.findAndCountAll({
      distinct: true,
      where: { ...query },
      order: [['createdAt', 'DESC']],
      include: [
        GET_STORE_INCLUDE(),
        GET_POSSESSION_ENTRY_ITEM_INCLUDE(),
        {
          ...GET_USER_INCLUDE(),
          as: 'creator'
        },
        {
          ...GET_USER_INCLUDE(),
          as: 'closer'
        }
      ],
      ...(pagination?.getPagination() ?? {}),
    });
  }

  async closePos(storeId: string, closedBy: string) {
    return this.sequelize.transaction(async t => {
      const tx = { transaction: t };

      const currentSession = await this.getSessionByStore(storeId);

      if (!currentSession) throw new NotFoundException('Session not found');

      if (currentSession.status !== PosSessionEntryStatus.ACTIVE) {
        throw new ConflictException('POS session is already closed');
      }

      await Promise.all(
        currentSession.items.map(async m => {
          await this.binService.updateAfterSessionPos(
            m.itemId,
            m.soldQty,
            tx,
          );
        })
      )
      currentSession.closedBy = closedBy;
      currentSession.status = PosSessionEntryStatus.CLOSED;
      currentSession.closedAt = new Date().toISOString();

      await currentSession.save(tx);
    })
  }

  private async autocloseSession() {
    const sessions = await this.model.findAll({
      where: {
        status: PosSessionEntryStatus.ACTIVE
      }
    });

    await Promise.all(
      sessions.map(async s => this.closePos(s.id, GET_ENV_VARIABLE('INITIAL_USER_ID')))
    )
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  protected cronMidnight() {
    this.logger.debug('Cron midnight running');
    this.autocloseSession()
  }
}
