import { ApiProperty } from "@nestjs/swagger";
import { StoreRole } from "../utils/store.types";
import { IsEnum, IsString } from "class-validator";

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
}
