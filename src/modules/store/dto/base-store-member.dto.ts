import { ApiProperty } from "@nestjs/swagger";
import { StoreRole } from "../utils/store.types";
import { IsBoolean, IsEnum, IsString } from "class-validator";
import { Type } from "class-transformer";

export class BaseStoreMemberDto {
  @ApiProperty({ type: String, description: 'ID of the store', example: '01J8Q2M6K4N7P9R3T5V0W1X2YZ' })
  @IsString()
  storeId: string;
  @ApiProperty({ type: String, description: 'ID of the member user', example: '01J8Q2M6K4N7P9R3T5V0W1X2YZ' })
  @IsString()
  userId: string;
  @ApiProperty({ enum: StoreRole, enumName: 'StoreRole', description: 'Member role within the store' })
  @IsEnum(StoreRole)
  role: StoreRole;
  @ApiProperty({ type: Boolean, description: 'Whether this is the default store for the member', example: true })
  @Type(() => Boolean)
  @IsBoolean()
  isDefault: boolean;
}
