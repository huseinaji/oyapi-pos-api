import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Table,
} from 'sequelize-typescript';
import {
  AuditableCreatorModel,
  BaseModel,
} from '../../../common/base/base-model';
import { User } from '../../user/entities/user.entity';
import { StoreStatus } from '../utils/store.types';
import { StoreMember } from './store-member.entity';

@Table({
  timestamps: true,
  paranoid: true,
})
export class Store extends BaseModel implements AuditableCreatorModel {
  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  declare name: string;
  @Column({
    type: DataType.STRING,
  })
  declare imageUrl: string;
  @Column({
    type: DataType.STRING,
  })
  declare address: string;
  @Column({
    type: DataType.STRING,
  })
  declare phone: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: StoreStatus.ACTIVE,
  })
  declare status: StoreStatus;

  @ForeignKey(() => User)
  declare createdBy: string;

  @BelongsTo(() => User)
  declare creator: User;

  @Column({
    type: DataType.STRING,
  })
  declare updatedBy: string;

  @HasMany(() => StoreMember)
  declare storeMember: StoreMember[];
}
