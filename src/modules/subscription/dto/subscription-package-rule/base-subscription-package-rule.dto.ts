import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { SubscriptionRuleValueType } from '../../utils/subscription.types';

export class BaseSubscriptionPackageRuleDto {
  @ApiProperty({ type: String, description: 'Rule ULID' })
  @IsString()
  id: string;

  @ApiProperty({
    type: String,
    description: 'Owning package ULID',
    example: '01J8Q2M6K4N7P9R3T5V0W1X2YZ',
  })
  @IsString()
  packageId: string;

  @ApiProperty({
    type: String,
    description: 'Rule key applied when evaluating the package',
    example: 'maxStores',
  })
  @IsString()
  ruleKey: string;

  @ApiProperty({
    enum: SubscriptionRuleValueType,
    enumName: 'SubscriptionRuleValueType',
    description: 'How value should be interpreted',
    example: SubscriptionRuleValueType.NUMBER,
  })
  @IsEnum(SubscriptionRuleValueType)
  valueType: SubscriptionRuleValueType;

  @ApiProperty({
    type: String,
    description: 'Serialized rule value',
    example: '1',
  })
  @IsString()
  value: string;
}
