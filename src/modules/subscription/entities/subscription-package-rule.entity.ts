import { BelongsTo, Column, DataType, ForeignKey, Table } from 'sequelize-typescript';
import { BaseModel } from '../../../common/base/base-model';
import { SubscriptionRuleValueType } from '../utils/subscription.types';
import { SubscriptionPackage } from './subscription-package.entity';

@Table({
  timestamps: true,
})
export class SubscriptionPackageRule extends BaseModel {
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
  })
  declare ruleKey: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare valueType: SubscriptionRuleValueType;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare value: string;
}
