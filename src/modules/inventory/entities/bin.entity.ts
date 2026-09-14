import { BelongsTo, Column, DataType, ForeignKey, Table } from "sequelize-typescript";
import { BaseModel } from "../../../common/base/base-model";
import { Item } from "./item.entity";
import { Store } from "../../store/entities/store.entity";

@Table({
  timestamps: true,
})
export class Bin extends BaseModel {
  // @ForeignKey(() => Store)
  // @Column({ type: DataType.STRING(26), allowNull: false})
  // declare storeId: string;
  // 
  // @BelongsTo(() => Store)
  // declare store: Store;

  @ForeignKey(() => Item)
  @Column({
    type: DataType.CHAR(26),
    allowNull: false,
    unique: true,
  })
  declare itemId: string;

  @BelongsTo(() => Item)
  declare item: Item;

  @Column({
    type: DataType.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
  })
  declare stockValue: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'pcs'
  })
  declare uom: string;
}
