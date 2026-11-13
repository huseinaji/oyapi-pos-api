import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { StoreRole } from '../utils/store.types';

export class AssignMmeberStoreDto {
  @ApiProperty({
    type: String,
    description: 'ID of the user to add to the store',
    example: '01J8Q2M6K4N7P9R3T5V0W1X2YZ',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    type: String,
    description: 'Role of the user',
    enum: StoreRole,
  })
  @IsEnum(StoreRole)
  role: StoreRole;
}

export class DisableMemberStoreDto extends PickType(AssignMmeberStoreDto, [
  'userId',
]) {}
