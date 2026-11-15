import { PartialType, PickType } from '@nestjs/swagger';
import { BaseSubscriptionDto } from './base-subscription.dto';

export class UpdateSubscriptionDto extends PartialType(
  PickType(BaseSubscriptionDto, [
    'packageId',
    'status',
    'startedAt',
    'endsAt',
    'canceledAt',
  ] as const),
) {}
