import { ApiProperty } from "@nestjs/swagger";
import { StoreRole } from "../utils/store.types";
import { IsBoolean, IsEnum, IsString } from "class-validator";
import { Type } from "class-transformer";

export class BaseStoreMemberDto {
  @ApiProperty()
  @IsString()
  storeId: string;
  @ApiProperty()
  @IsString()
  userId: string;
  @ApiProperty()
  @IsEnum(StoreRole)
  role: StoreRole;
  @ApiProperty()
  @Type(() => Boolean)
  @IsBoolean()
  isDefault: boolean;
}
