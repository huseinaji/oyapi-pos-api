import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { TxOptions } from '../../../common/base/base.service';
import { Item } from '../entities/item.entity';
import { StockLedgerEntryService } from './stock-ledger-entry.service';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { GET_BIN_INCLUDE } from '../utils/includes/bin.include';
import { FindOptions, Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import {
  LedgerDirection,
  LedgerReference,
} from '../utils/types/stock-ledger-entry.type';
import { type UserAuthPayload } from '../../auth/utils/auth.type';
import { UpdateItemDto } from '../dto/items/update-item.dto';
import { BaseItemDto } from '../dto/items/base-item.dto';
import { CreateItemDto } from '../dto/items/create-item.dto';
import { GET_ITEM_CATEGORY_INCLUDE } from '../utils/includes/item-category.include';
import { ItemStatus, ItemType } from '../utils/types/item.type';
import { Bin } from '../entities/bin.entity';
import { ItemBundleComponent } from '../entities/item-bundle-component.entity';
import { HandleSequelizeErrors } from '../../../common/decorator/db-err-handler';
import { GET_ITEMBUNDLECOMPONENT_INCLUDE } from '../utils/includes/item-bundle-component.include';

@Injectable()
export class ItemService {
  constructor(
    @InjectModel(Item) protected model: typeof Item,
    @InjectModel(Bin) protected binModel: typeof Bin,
    @InjectModel(ItemBundleComponent)
    protected itemBundleComponentModel: typeof ItemBundleComponent,
    private readonly stockLedgerService: StockLedgerEntryService,
    private sequelize: Sequelize,
  ) {}

  private validateExisting(entity: Item | null) {
    if (!entity) {
      throw new NotFoundException('Item not found');
    }
    return entity;
  }

  async getStock(id: string, options?: TxOptions): Promise<number> {
    return (
      (await this.binModel.findOne({ where: { itemId: id }, ...options }))
        ?.actualQty || 0
    );
  }

  private async createLedgerEntry(
    args: {
      dto: CreateItemDto;
      actor: UserAuthPayload;
      itemData: Item;
    },
    options?: TxOptions,
  ) {
    if (!args.dto.isMaintainStock || args.dto.type == ItemType.ITEM_BUNDLE)
      return true;

    await this.stockLedgerService.create(
      {
        createDto: {
          itemId: args.itemData.id,
          qty: args.dto.initialStock,
          ledgerDirection: LedgerDirection.IN,
          storeId: args.actor.store!.storeId,
          reference: LedgerReference.ITEM,
          referenceId: args.itemData.id,
        },
      },
      options,
    );
  }

  updateComponent(qty: number, componentId: string) {
    return this.itemBundleComponentModel.update(
      {
        qty,
      },
      {
        where: {
          id: componentId,
        },
      },
    );
  }

  private async createBulkItemBundleComponent(
    dto: CreateItemDto,
    itemData: Item,
    options?: TxOptions,
  ) {
    if (itemData.type !== ItemType.ITEM_BUNDLE) return;

    const data = dto.itemComponents;

    if (!data) throw new BadRequestException('Item component not found');

    const componentIds = data.map((component) => component.componentItemId);
    if (new Set(componentIds).size !== componentIds.length) {
      throw new BadRequestException(
        'componentItemId must be unique within itemComponents',
      );
    }

    const records = await Promise.all(data.map(async (d) => {
      const compItemData = await this.findOne(d.componentItemId, options);
      if (compItemData.type !== ItemType.RAW_MATERIAL) throw new UnprocessableEntityException('Only raw material item can be component item');
      return { ...d, itemId: itemData.id }
    }));

    return this.itemBundleComponentModel.bulkCreate(records, options);
  }

  @HandleSequelizeErrors()
  async create(data: CreateItemDto, actor: UserAuthPayload): Promise<Item> {
    const { initialStock, ...dto } = data;

    return await this.sequelize.transaction(async (t) => {
      const tx = { transaction: t };

      const itemData = await this.model.create(
        {
          ...dto,
          isMaintainStock:
            dto.type === ItemType.ITEM_BUNDLE ? false : dto.isMaintainStock,
          basePrice: dto.type === ItemType.RAW_MATERIAL ? 0 : dto.basePrice,
          sellingPrice:
            dto.type === ItemType.RAW_MATERIAL ? 0 : dto.sellingPrice,
          createdBy: actor.sub,
        },
        {
          ...tx,
          hooks: true,
        },
      );

      // * Selain item bundle diabaikan
      await this.createBulkItemBundleComponent(data, itemData, tx);

      // * selain maintain stock diabaikan
      await this.createLedgerEntry(
        {
          dto: data,
          actor,
          itemData,
        },
        tx,
      );

      return itemData;
    });
  }

  async findAndCountAll(
    query: Partial<BaseItemDto>,
    pagination?: PaginationDto,
    options?: TxOptions,
  ): Promise<{ rows: Item[]; count: number }> {
    return this.model.findAndCountAll({
      where: { ...query },
      order: [['createdAt', 'DESC']],
      include: [
        GET_BIN_INCLUDE(),
        GET_ITEM_CATEGORY_INCLUDE(),
        {
          ...GET_ITEMBUNDLECOMPONENT_INCLUDE(),
          as: 'itemComponents',
        },
      ],
      ...(pagination?.getPagination() ?? {}),
      ...options,
    });
  }

  async findOne(id: string, options?: FindOptions): Promise<Item> {
    const result = await this.model.findByPk(id, {
      include: [
        GET_BIN_INCLUDE(),
        GET_ITEM_CATEGORY_INCLUDE(),
        {
          ...GET_ITEMBUNDLECOMPONENT_INCLUDE(),
          as: 'itemComponents',
        },
      ],
      ...options,
    });

    return this.validateExisting(result);
  }

  findAllSellableItem() {
    return this.model.findAll({
      where: {
        type: { [Op.ne]: ItemType.RAW_MATERIAL },
        status: ItemStatus.ACTIVE,
      },
      include: [GET_ITEMBUNDLECOMPONENT_INCLUDE()],
    });
  }

  async update(id: string, data: UpdateItemDto) {
    const currentData = await this.findOne(id);

    const statusIsChanging =
      data.status !== undefined && data.status !== currentData.status;

    if (statusIsChanging && currentData.type === ItemType.RAW_MATERIAL) {
      throw new BadRequestException('Raw material item status cannot be changed');
    }

    return await currentData.update(
      {
        ...data,
      },
      { hooks: true },
    );
  }

  async remove(id: string) {
    const currentData = await this.findOne(id);

    if (currentData.type === ItemType.RAW_MATERIAL) {
      await this.validateDeleteItemBundleComponentUsed(currentData);
    }

    return currentData.destroy();
  }

  private async validateDeleteItemBundleComponentUsed(item: Item) {
    const itemComponents = await this.itemBundleComponentModel.findOne({
      where: {
        componentItemId: item.id,
      },
    });

    if (!itemComponents) return;

    throw new ConflictException(
      `item ${item.id} is being used by item bundle ${itemComponents.id}`,
    );
  }

  async getSellableItemByStore(
    storeId: string,
    options?: TxOptions,
  ): Promise<Item[]> {
    const result = await this.model.findAll({
      where: {
        storeId,
        status: ItemStatus.ACTIVE,
        type: ItemType.FINISHED_GOOD,
      },
      include: [GET_BIN_INCLUDE()],
      ...options,
    });

    return result;
  }

  async getPosSessionAvailableItem(
    storeId: string,
    options?: TxOptions,
  ): Promise<Item[]> {
    return this.model.findAll({
      where: {
        storeId,
        status: ItemStatus.ACTIVE,
        isMaintainStock: true,
        type: { [Op.ne]: ItemType.ITEM_BUNDLE },
      },
      include: [GET_BIN_INCLUDE()],
      ...options,
    });
  }
}
