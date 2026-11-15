import { PartialType, PickType } from '@nestjs/swagger';
import { BaseSubscriptionPackageDto } from './base-subscription-package.dto';

export class UpdateSubscriptionPackageDto extends PartialType(
  PickType(BaseSubscriptionPackageDto, [
    'name',
    'description',
    'isActive',
    'sortOrder',
  ] as const),
) {}
