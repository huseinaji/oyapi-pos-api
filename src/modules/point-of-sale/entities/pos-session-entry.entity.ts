import { BelongsTo, Column, DataType, ForeignKey, HasMany, Table } from "sequelize-typescript";
import { BaseModel } from "../../../common/base/base-model";
import { User } from "../../user/entities/user.entity";
import { Store } from "../../store/entities/store.entity";
import { PosSessionEntryItem } from "./pos-session-entry-item.entity";

@Table({
  timestamps: true
})
export class PosSessionEntry extends BaseModel {
  @ForeignKey(() => User)
  declare createdBy: string;

  @BelongsTo(() => User, { as: 'creator' })
  declare creator: User;

  @ForeignKey(() => Store)
  declare storeId: string;

  @BelongsTo(() => Store)
  declare store: Store;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'active'
  })
  declare status: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare closedAt: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.STRING(26), allowNull: true })
  declare closedBy: string;

  @BelongsTo(() => User, { as: 'closer' })
  declare closer: User;

  @HasMany(() => PosSessionEntryItem, {
    foreignKey: 'posSessionId'
  })
  declare items: PosSessionEntryItem[]
}
