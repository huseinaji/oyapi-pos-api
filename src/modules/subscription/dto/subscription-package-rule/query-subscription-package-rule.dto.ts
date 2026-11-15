import { OmitType, PartialType } from '@nestjs/swagger';
import { BaseSubscriptionPackageRuleDto } from './base-subscription-package-rule.dto';

export class QuerySubscriptionPackageRuleDto extends PartialType(
  OmitType(BaseSubscriptionPackageRuleDto, ['id'] as const),
) {}
