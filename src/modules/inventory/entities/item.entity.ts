import { Column, DataType, ForeignKey, HasOne, Table } from 'sequelize-typescript';
import { BaseModel } from '../../../common/base/base-model';
import { User } from '../../user/entities/user.entity';
import { ItemCategory } from '../utils/item.types';
import { Bin } from './bin.entity';

@Table({
  timestamps: true,
})
export class Item extends BaseModel {
  // @ForeignKey(() => Store)
  // @Column({ type: DataType.STRING(26), allowNull: false})
  // declare storeId: string;
  // 
  // @BelongsTo(() => Store)
  // declare store: Store;
  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  declare name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: ItemCategory.FINISHED_GOOD
  })
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

  @HasOne(() => Bin)
  declare bin: Bin;
}
