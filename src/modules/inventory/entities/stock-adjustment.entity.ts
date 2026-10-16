import { Column, DataType, HasMany, Table } from "sequelize-typescript";
import { BaseModel } from "../../../common/base/base-model";
import { StockAdjustmentType } from "../utils/types/stock-adjustment.type";
import { StockAdjustmentItem } from "./stock-adjustment-item.entity";

@Table({
  timestamps: true
})
export class StockAdjustment extends BaseModel {
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare type: StockAdjustmentType;

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  declare remarks: string;

  @HasMany(() => StockAdjustmentItem, {
    onDelete: 'CASCADE',
    hooks: true
  })
  declare items: StockAdjustmentItem[];
}
