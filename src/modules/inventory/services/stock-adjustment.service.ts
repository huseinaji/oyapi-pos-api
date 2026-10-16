import { InjectModel } from "@nestjs/sequelize";
import { CreateStockAdjustmentDto } from "../dto/stock-adjustment/create-stock-adjustment.dto";
import { StockAdjustment } from "../entities/stock-adjustment.entity";
import { StockAdjustmentItem } from "../entities/stock-adjustment-item.entity";
import { Sequelize } from "sequelize-typescript";
import { BadRequestException } from "@nestjs/common";
import { BaseStockAdjustmentDto } from "../dto/stock-adjustment/base-stock-adjustment.dto";
import { TxOptions } from "../../../common/base/base.service";

export class StockAdjustmentService {
  constructor(
    @InjectModel(StockAdjustment) private model: typeof StockAdjustment,
    @InjectModel(StockAdjustmentItem) private adjustmentItemModel: typeof StockAdjustmentItem,
    private sequelize: Sequelize,
  ) { }

  async create(dto: CreateStockAdjustmentDto) {
    const { items, ...data } = dto;

    return this.sequelize.transaction(async t => {
      const tx = { transaction: t };

      const result = await this.model.create({
        ...data
      }, tx)

      if (!items.length) throw new BadRequestException('Items mandatory');

      const itemRecords = items.map(i => ({
        ...i,
        stockAdjustmentId: result.id,
      }))

      await this.adjustmentItemModel.bulkCreate(itemRecords, tx);
      return result;
    })
  }

  async findAndCountAll(query: BaseStockAdjustmentDto) {
    return this.model.findAndCountAll({
      where: {
        ...query
      },
      order: [['createdAt', 'DESC']],

    })
  }

  async delete(id: string, options?: TxOptions) {
    this.model.destroy({ where: { id }, ...options });
  }
}
