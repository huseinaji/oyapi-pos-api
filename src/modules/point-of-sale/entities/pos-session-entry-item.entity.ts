import { BelongsTo, Column, DataType, ForeignKey, Table } from "sequelize-typescript";
import { BaseModel } from "../../../common/base/base-model";
import { Item } from "../../inventory/entities/item.entity";
import { PosSessionEntry } from "./pos-session-entry.entity";

@Table({
  timestamps: false,
})
export class PosSessionEntryItem extends BaseModel {
  @ForeignKey(() => PosSessionEntry)
  declare posSessionId: string;

  @BelongsTo(() => PosSessionEntry)
  declare posSession: PosSessionEntry;

  @ForeignKey(() => Item)
  declare itemId: string;

  @BelongsTo(() => Item)
  declare item: Item

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare openingQty: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare closingQty: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  declare soldQty: number;
}
