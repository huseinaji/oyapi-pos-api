import { OmitType, PartialType } from '@nestjs/swagger';
import { BaseSubscriptionDto } from './base-subscription.dto';

export class QuerySubscriptionDto extends PartialType(
  OmitType(BaseSubscriptionDto, ['id'] as const),
) {}
