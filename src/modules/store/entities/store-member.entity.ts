import { BelongsTo, Column, DataType, ForeignKey, Table } from 'sequelize-typescript';
import { BaseModel } from '../../../common/base/base-model';
import { StoreMemberStatus, StoreRole } from '../utils/store.types';
import { Store } from './store.entity';
import { User } from '../../user/entities/user.entity';

@Table({
  timestamps: true,
})
export class StoreMember extends BaseModel {
  @ForeignKey(() => Store)
  @Column({
    type: DataType.STRING(26),
    allowNull: false,
  })
  declare storeId: string;

  @BelongsTo(() => Store)
  declare store: Store;

  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING(26),
  })
  declare userId: string;

  @BelongsTo(() => User)
  declare user: User;

  @Column({
    type: DataType.STRING(26),
    allowNull: false,
    defaultValue: StoreRole.CASHIER,
  })
  declare role: StoreRole;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: StoreMemberStatus.ACTIVE
  })
  declare status: StoreMemberStatus;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
    defaultValue: null,
  })
  declare isDefault: true | null;
}
