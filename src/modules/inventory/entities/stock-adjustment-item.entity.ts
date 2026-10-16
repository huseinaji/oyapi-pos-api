import { BelongsTo, Column, DataType, ForeignKey, Table } from "sequelize-typescript";
import { BaseModel } from "../../../common/base/base-model";
import { Item } from "./item.entity";

@Table({
  timestamps: false
})
export class StockAdjustmentItem extends BaseModel {
  @Column({ type: DataType.STRING(26), allowNull: false })
  declare stockAdjustmentId: string;

  @ForeignKey(() => Item)
  @Column({ type: DataType.STRING(26), allowNull: false })
  declare itemId: string;

  @BelongsTo(() => Item)
  declare items: Item;

  @Column({ type: DataType.NUMBER, defaultValue: 0 })
  declare qty: number;
}
