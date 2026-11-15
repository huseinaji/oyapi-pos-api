import { PartialType, PickType } from '@nestjs/swagger';
import { BaseSubscriptionPackageRuleDto } from './base-subscription-package-rule.dto';

export class UpdateSubscriptionPackageRuleDto extends PartialType(
  PickType(BaseSubscriptionPackageRuleDto, [
    'ruleKey',
    'valueType',
    'value',
  ] as const),
) {}
