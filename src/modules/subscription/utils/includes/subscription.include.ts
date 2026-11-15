import { IncludeOptions } from 'sequelize';
import { Subscription } from '../../entities/subscription.entity';
import { GET_SUBSCRIPTION_PACKAGE_WITH_RULES_INCLUDE } from './subscription-package.include';

export function GET_SUBSCRIPTION_INCLUDE(): IncludeOptions {
  return {
    model: Subscription,
    required: false,
    attributes: [
      'id',
      'userId',
      'packageId',
      'status',
      'startedAt',
      'endsAt',
      'canceledAt',
    ],
  };
}

export function GET_SUBSCRIPTION_WITH_PACKAGE_RULES_INCLUDE(): IncludeOptions {
  return {
    model: Subscription,
    required: false,
    attributes: [
      'id',
      'userId',
      'packageId',
      'status',
      'startedAt',
      'endsAt',
      'canceledAt',
    ],
    include: [GET_SUBSCRIPTION_PACKAGE_WITH_RULES_INCLUDE()],
  };
}
