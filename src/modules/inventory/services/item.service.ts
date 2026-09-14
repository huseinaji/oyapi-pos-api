import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  BaseService,
  CreateOptions,
  FindAllOptions,
  FindOneOptions,
  TxOptions,
} from '../../../common/base/base.service';
import { Item } from '../entities/item.entity';
import { StockLedgerEntryService } from './stock-ledger-entry.service';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { GET_BIN_INCLUDE } from '../utils/bin.include';
import { CreateItemDto } from '../dto/create-item.dto';
import { FindOptions, UniqueConstraintError } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { LedgerDirection } from '../utils/stock-ledger-entry.type';
import { BinService } from './bin.service';

@Injectable()
export class ItemService extends BaseService<Item> {
  constructor(
    @InjectModel(Item) protected model: typeof Item,
    private readonly stockLedgerService: StockLedgerEntryService,
    private sequelize: Sequelize,
    private binService: BinService,
  ) {
    super(model);
  }

  async create(
    createOptions: CreateOptions<CreateItemDto>,
  ): Promise<Item> {
    const user = createOptions.user;
    let itemData: Item;
    const { initialStock, ...dto } = createOptions.createDto;

    if (!user) {
      throw new InternalServerErrorException('User missing on creating items');
    }

    return await this.sequelize.transaction(async t => {
      const tx = { transaction: t };
      try {
        itemData = await this.model.create(
          {
            ...dto,
            createdBy: user.sub,
          },
          tx,
        );
      } catch (error) {
        if (error instanceof UniqueConstraintError) {
          throw new ConflictException('Duplicate entry');
        }
        throw error;
      }

      if (!dto.isMaintainStock) return itemData;

      await this.stockLedgerService.create({
        createDto: {
          itemId: itemData.id,
          qty: initialStock,
          ledgerDirection: LedgerDirection.IN,
        }
      }, tx)


      return itemData;
    })
  }

  async findAndCountAll(findAllOptions: FindAllOptions, pagination?: PaginationDto, options?: TxOptions): Promise<{ rows: Item[]; count: number; }> {
    return this.model.findAndCountAll({
      where: { ...findAllOptions.queryDto },
      order: [['createdAt', 'DESC']],
      include: [
        GET_BIN_INCLUDE()
      ],
      ...(pagination?.getPagination() ?? {}),
      ...options,
    });
  }

  async findOne(findOneOptions: FindOneOptions, options?: FindOptions): Promise<Item> {
    const result = await this.model.findByPk(findOneOptions.id, {
      include: [
        GET_BIN_INCLUDE()
      ],
      ...options
    });

    return this.validateExisting(result);
  }

  async checkStock(id: string, options?: TxOptions) {
    return this.binService.checkStock(id, options);
  }
}
