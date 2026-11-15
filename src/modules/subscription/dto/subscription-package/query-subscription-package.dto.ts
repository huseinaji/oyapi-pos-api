import { OmitType, PartialType } from '@nestjs/swagger';
import { BaseSubscriptionPackageDto } from './base-subscription-package.dto';

export class QuerySubscriptionPackageDto extends PartialType(
  OmitType(BaseSubscriptionPackageDto, ['description'] as const),
) {}
