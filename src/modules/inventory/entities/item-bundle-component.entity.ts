import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Table,
} from 'sequelize-typescript';
import { BaseModel } from '../../../common/base/base-model';
import { Item } from './item.entity';

@Table({
  timestamps: false,
})
export class ItemBundleComponent extends BaseModel {
  @ForeignKey(() => Item)
  @Column({ type: DataType.STRING, allowNull: false })
  declare itemId: string;

  @BelongsTo(() => Item, { foreignKey: 'itemId' })
  declare sourceItem: Item;

  @ForeignKey(() => Item)
  @Column({ type: DataType.STRING, allowNull: false })
  declare componentItemId: string;

  @BelongsTo(() => Item, {
    foreignKey: 'componentItemId',
  })
  declare componentItem: Item;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare qty: number;
}
