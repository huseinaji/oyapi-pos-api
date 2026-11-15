import { BelongsTo, Column, DataType, ForeignKey, Table } from 'sequelize-typescript';
import { BaseModel } from '../../../common/base/base-model';
import { User } from '../../user/entities/user.entity';
import { SubscriptionStatus } from '../utils/subscription.types';
import { SubscriptionPackage } from './subscription-package.entity';

@Table({
  timestamps: true,
})
export class Subscription extends BaseModel {
  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING(26),
    allowNull: false,
  })
  declare userId: string;

  @BelongsTo(() => User)
  declare user: User;

  @ForeignKey(() => SubscriptionPackage)
  @Column({
    type: DataType.STRING(26),
    allowNull: false,
  })
  declare packageId: string;

  @BelongsTo(() => SubscriptionPackage)
  declare package: SubscriptionPackage;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: SubscriptionStatus.PENDING,
  })
  declare status: SubscriptionStatus;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare startedAt: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare endsAt: Date | null;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare canceledAt: Date | null;
}
