import { IncludeOptions } from 'sequelize';
import { SubscriptionPackage } from '../../entities/subscription-package.entity';
import { SubscriptionPackageRule } from '../../entities/subscription-package-rule.entity';

export function GET_SUBSCRIPTION_PACKAGE_INCLUDE(): IncludeOptions {
  return {
    model: SubscriptionPackage,
    required: false,
    attributes: ['id', 'code', 'name', 'isActive', 'sortOrder'],
  };
}

export function GET_SUBSCRIPTION_PACKAGE_WITH_RULES_INCLUDE(): IncludeOptions {
  return {
    model: SubscriptionPackage,
    required: false,
    attributes: ['id', 'code', 'name', 'description', 'isActive', 'sortOrder'],
    include: [
      {
        model: SubscriptionPackageRule,
        required: false,
        attributes: ['id', 'ruleKey', 'valueType', 'value'],
      },
    ],
  };
}
