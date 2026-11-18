import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Table,
} from 'sequelize-typescript';
import { BaseModel } from '../../../common/base/base-model';
import { User } from '../../user/entities/user.entity';
import { Store } from '../../store/entities/store.entity';
import { PosSessionEntryItem } from './pos-session-entry-item.entity';
import { PosSessionEntryStatus } from '../utils/pos.type';

@Table({
  timestamps: true,
})
export class PosSessionEntry extends BaseModel {
  @ForeignKey(() => User)
  declare createdBy: string;

  @BelongsTo(() => User, { as: 'creator', foreignKey: 'createdBy' })
  declare creator: User;

  @ForeignKey(() => Store)
  declare storeId: string;

  @BelongsTo(() => Store)
  declare store: Store;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'active',
  })
  declare status: PosSessionEntryStatus;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare closedAt: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  declare openingCash: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare actualCash: number | null;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare remarks: string | null;

  @ForeignKey(() => User)
  @Column({ type: DataType.STRING(26), allowNull: true })
  declare closedBy: string;

  @BelongsTo(() => User, { as: 'closer', foreignKey: 'closedBy' })
  declare closer: User;

  @HasMany(() => PosSessionEntryItem, {
    foreignKey: 'posSessionId',
  })
  declare items: PosSessionEntryItem[];
}
