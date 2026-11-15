import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { SubscriptionStatus } from '../../utils/subscription.types';

export class BaseSubscriptionDto {
  @ApiProperty({ type: String, description: 'Subscription ULID' })
  @IsString()
  id: string;

  @ApiProperty({
    type: String,
    description: 'Subscribing user ULID',
    example: '01J8Q2M6K4N7P9R3T5V0W1X2YZ',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    type: String,
    description: 'Selected package ULID',
    example: '01J8Q2M6K4N7P9R3T5V0W1X2YZ',
  })
  @IsString()
  packageId: string;

  @ApiProperty({
    enum: SubscriptionStatus,
    enumName: 'SubscriptionStatus',
    description: 'Lifecycle status',
    example: SubscriptionStatus.ACTIVE,
  })
  @IsEnum(SubscriptionStatus)
  status: SubscriptionStatus;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'When the subscription period started',
  })
  @IsDateString()
  startedAt: string;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'When the subscription period ends; null for non-expiring plans',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  endsAt: string | null;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'When the subscription was canceled',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  canceledAt: string | null;
}
