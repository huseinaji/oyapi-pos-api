import { Injectable } from '@nestjs/common';
import { StockLedgerEntry } from '../entities/stock-ledger-entry.entity';
import {
  BaseService,
  CreateOptions,
  FindAllOptions,
  TxOptions,
} from '../../../common/base/base.service';
import { InjectModel } from '@nestjs/sequelize';
import {
  LedgerDirection,
  StockLedgerEntryStatus,
} from '../utils/types/stock-ledger-entry.type';
import { BinService } from './bin.service';
import { CreateStockLedgerEntryDto } from '../dto/stock-ledger-entry/create-stockledgerentry.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { GET_ITEM_INCLUDE } from '../utils/includes/item.include';

@Injectable()
export class StockLedgerEntryService extends BaseService<StockLedgerEntry> {
  constructor(
    @InjectModel(StockLedgerEntry) protected model: typeof StockLedgerEntry,
    private readonly binService: BinService,
  ) {
    super(model);
  }

  async calculateBalanceAfter(dto: CreateStockLedgerEntryDto) {
    const lastStock =
      (
        await this.model.findAll({
          where: {
            itemId: dto.itemId,
            status: StockLedgerEntryStatus.ACTIVE,
          },
          order: [['createdAt', 'DESC']],
        })
      )[0]?.balanceAfter || 0;

    if (dto.ledgerDirection === LedgerDirection.OUT) {
      return lastStock - dto.qty;
    }
    return lastStock + dto.qty;
  }

  async create(
    createOptions: CreateOptions<CreateStockLedgerEntryDto>,
    options?: TxOptions,
  ): Promise<StockLedgerEntry> {
    const dto = createOptions.createDto;
    const balanceAfter = await this.calculateBalanceAfter(dto);

    const result = await this.model.create(
      {
        ...createOptions.createDto,
        balanceAfter,
      },
      options,
    );

    await this.binService.updateOrCreateBin(
      {
        itemId: dto.itemId,
        qty: balanceAfter,
        storeId: dto.storeId,
      },
      options,
    );

    return result;
  }

  async findAndCountAll(
    findAllOptions: FindAllOptions,
    pagination?: PaginationDto,
  ): Promise<{ rows: StockLedgerEntry[]; count: number }> {
    return this.model.findAndCountAll({
      where: {
        ...findAllOptions.queryDto,
      },
      include: [GET_ITEM_INCLUDE()],
      order: [['createdAt', 'DESC']],
      ...(pagination?.getPagination() ?? {}),
    });
  }
}
