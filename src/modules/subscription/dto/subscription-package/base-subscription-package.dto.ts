import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { SubscriptionPackageCode } from '../../utils/subscription.types';

export class BaseSubscriptionPackageDto {
  @ApiProperty({ type: String, description: 'Package ULID' })
  @IsString()
  id: string;

  @ApiProperty({
    enum: SubscriptionPackageCode,
    enumName: 'SubscriptionPackageCode',
    description: 'Stable package code',
    example: SubscriptionPackageCode.FREE,
  })
  @IsEnum(SubscriptionPackageCode)
  code: SubscriptionPackageCode;

  @ApiProperty({ type: String, description: 'Display name', example: 'Free' })
  @IsString()
  name: string;

  @ApiProperty({
    type: String,
    description: 'Optional package description',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  description: string | null;

  @ApiProperty({ type: Boolean, description: 'Whether the package is offerable', example: true })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ type: Number, description: 'Display sort order', example: 0 })
  @IsInt()
  sortOrder: number;
}
