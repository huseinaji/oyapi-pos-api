import { InjectModel } from '@nestjs/sequelize';
import { CreateStockAdjustmentDto } from '../dto/stock-adjustment/create-stock-adjustment.dto';
import { StockAdjustment } from '../entities/stock-adjustment.entity';
import { StockAdjustmentItem } from '../entities/stock-adjustment-item.entity';
import { Sequelize } from 'sequelize-typescript';
import { BadRequestException } from '@nestjs/common';
import { BaseStockAdjustmentDto } from '../dto/stock-adjustment/base-stock-adjustment.dto';
import { TxOptions } from '../../../common/base/base.service';
import { StockLedgerEntryService } from './stock-ledger-entry.service';
import { LedgerDirection, LedgerReference } from '../utils/types/stock-ledger-entry.type';
import { StockAdjustmentType } from '../utils/types/stock-adjustment.type';
import { HandleSequelizeErrors } from '../../../common/decorator/db-err-handler';
import { GET_ITEM_INCLUDE } from '../utils/includes/item.include';

interface createStockAdjustmentArgs extends CreateStockAdjustmentDto { storeId: string };

export class StockAdjustmentService {
  constructor(
    @InjectModel(StockAdjustment) private model: typeof StockAdjustment,
    @InjectModel(StockAdjustmentItem)
    private adjustmentItemModel: typeof StockAdjustmentItem,
    private readonly stockLedgerService: StockLedgerEntryService,
    private sequelize: Sequelize,
  ) { }

  @HandleSequelizeErrors()
  async create(dto: createStockAdjustmentArgs) {
    const { items, ...data } = dto;

    return this.sequelize.transaction(async (t) => {
      const tx = { transaction: t };

      const result = await this.model.create(
        {
          ...data,
        },
        tx,
      );

      if (!items.length) throw new BadRequestException('Items mandatory');

      const itemRecords = items.map((i) => ({
        ...i,
        stockAdjustmentId: result.id,
      }));

      await this.adjustmentItemModel.bulkCreate(itemRecords, tx);
      await this.updateStockLedger(dto, tx);
      return {
        ...result.get({ plain: true }),
        items: itemRecords,
      }
    });
  }

  async updateStockLedger(dto: createStockAdjustmentArgs, options: TxOptions) {
    await Promise.all(
      dto.items.map(async (item) => {
        await this.stockLedgerService.create({
          createDto: {
            itemId: item.itemId,
            qty: item.qty,
            ledgerDirection:
              dto.type == StockAdjustmentType.ISSUE
                ? LedgerDirection.OUT
                : LedgerDirection.IN,
            storeId: dto.storeId,
            reference: LedgerReference.ITEM
          },
        }, options);
      }),
    );
  }

  async findAndCountAll(query: Partial<BaseStockAdjustmentDto>) {
    return this.model.findAndCountAll({
      where: {
        ...query,
      },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: StockAdjustmentItem,
          include: [
            GET_ITEM_INCLUDE(),
          ]
        }
      ]
    });
  }

  async delete(id: string, options?: TxOptions) {
    this.model.destroy({ where: { id }, ...options });
  }
}
