import { BeforeCreate, BeforeUpdate, BelongsTo, Column, DataType, ForeignKey, Table } from "sequelize-typescript";
import { BaseModel } from "../../../common/base/base-model";
import { Item } from "./item.entity";
import { Store } from "../../store/entities/store.entity";

@Table({
  timestamps: true,
})
export class Bin extends BaseModel {
  @ForeignKey(() => Store)
  declare storeId: string;

  @BelongsTo(() => Store)
  declare store: Store;

  @ForeignKey(() => Item)
  declare itemId: string;

  @BelongsTo(() => Item)
  declare item: Item;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  declare qty: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  declare reservedQty: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  declare actualQty: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'pcs'
  })
  declare uom: string;

  @BeforeCreate
  @BeforeUpdate
  static calculateActualQty(instance: Bin) {
    if (!instance.changed('qty') && !instance.changed('reservedQty')) return true;

    instance.actualQty = instance.qty - instance.reservedQty;
  }
}
