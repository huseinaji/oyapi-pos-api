import { Column, DataType, ForeignKey, HasMany, Table } from "sequelize-typescript";
import { BaseModel } from "../../../common/base/base-model";
import { StockAdjustmentType } from "../utils/types/stock-adjustment.type";
import { StockAdjustmentItem } from "./stock-adjustment-item.entity";
import { Store } from "../../store/entities/store.entity";

@Table({
  timestamps: true
})
export class StockAdjustment extends BaseModel {
  @ForeignKey(() => Store)
  @Column({
    type: DataType.CHAR(26),
    allowNull: false
  })
  declare storeId: string;

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
