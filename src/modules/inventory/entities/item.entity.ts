import {
  BeforeCreate,
  BeforeUpdate,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  HasOne,
  Table,
} from 'sequelize-typescript';
import { BaseModel } from '../../../common/base/base-model';
import { User } from '../../user/entities/user.entity';
import { ItemStatus, ItemType } from '../utils/types/item.type';
import { Bin } from './bin.entity';
import { Store } from '../../store/entities/store.entity';
import { ItemCategory } from './item-category.entity';
import { ItemBundleComponent } from './item-bundle-component.entity';

@Table({
  timestamps: true,
})
export class Item extends BaseModel {
  @ForeignKey(() => Store)
  @Column({ type: DataType.STRING(26), allowNull: false })
  declare storeId: string;

  @BelongsTo(() => Store)
  declare store: Store;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  declare name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: ItemStatus.ACTIVE,
  })
  declare status: ItemStatus;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: ItemType.FINISHED_GOOD,
  })
  declare type: ItemType;

  @ForeignKey(() => ItemCategory)
  declare categoryId: string;

  @BelongsTo(() => ItemCategory)
  declare category: ItemCategory;

  @Column({
    type: DataType.TEXT,
  })
  declare description: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare uom: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare basePrice: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare sellingPrice: number;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  declare isMaintainStock: boolean;

  @ForeignKey(() => User)
  @Column({ type: DataType.CHAR(26), allowNull: false })
  declare createdBy: string;

  @BelongsTo(() => User)
  declare creator: User;

  @HasOne(() => Bin)
  declare bin: Bin;

  @HasMany(() => ItemBundleComponent)
  declare itemComponents: ItemBundleComponent[];

  @BeforeCreate
  @BeforeUpdate
  static setMaintainStock(instance: Item) {
    if (instance.type !== ItemType.ITEM_BUNDLE) return;
    instance.isMaintainStock = false;
  } 
}
