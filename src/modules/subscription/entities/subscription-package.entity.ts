import { Column, DataType, HasMany, Table } from 'sequelize-typescript';
import { BaseModel } from '../../../common/base/base-model';
import { SubscriptionPackageCode } from '../utils/subscription.types';
import { SubscriptionPackageRule } from './subscription-package-rule.entity';
import { Subscription } from './subscription.entity';

@Table({
  timestamps: true,
})
export class SubscriptionPackage extends BaseModel {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare code: SubscriptionPackageCode;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare description: string | null;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  declare isActive: boolean;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  declare sortOrder: number;

  @HasMany(() => SubscriptionPackageRule)
  declare rules: SubscriptionPackageRule[];

  @HasMany(() => Subscription)
  declare subscriptions: Subscription[];
}
