import { IntersectionType, PartialType, PickType } from '@nestjs/swagger';
import { BaseSubscriptionPackageDto } from './base-subscription-package.dto';

export class CreateSubscriptionPackageDto extends IntersectionType(
  PickType(BaseSubscriptionPackageDto, ['code', 'name'] as const),
  PartialType(
    PickType(BaseSubscriptionPackageDto, [
      'description',
      'isActive',
      'sortOrder',
    ] as const),
  ),
) {}
