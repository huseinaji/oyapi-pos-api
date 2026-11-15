import { PickType } from '@nestjs/swagger';
import { BaseSubscriptionPackageRuleDto } from './base-subscription-package-rule.dto';

export class CreateSubscriptionPackageRuleDto extends PickType(
  BaseSubscriptionPackageRuleDto,
  ['packageId', 'ruleKey', 'valueType', 'value'] as const,
) {}
