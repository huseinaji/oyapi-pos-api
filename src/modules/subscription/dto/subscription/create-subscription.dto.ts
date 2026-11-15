import { IntersectionType, PartialType, PickType } from '@nestjs/swagger';
import { BaseSubscriptionDto } from './base-subscription.dto';

export class CreateSubscriptionDto extends IntersectionType(
  PickType(BaseSubscriptionDto, ['userId', 'packageId', 'startedAt'] as const),
  PartialType(
    PickType(BaseSubscriptionDto, ['status', 'endsAt'] as const),
  ),
) {}
