import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsPhoneNumber, IsString } from "class-validator";
import { StoreStatus } from "../utils/store.types";

export class BaseStoreDto {
  @ApiProperty()
  @IsString()
  name: string;
  @ApiProperty()
  @IsString()
  imageUrl: string;
  @ApiProperty()
  @IsString()
  address: string;
  @ApiProperty()
  @IsPhoneNumber()
  phone: string;
  @ApiProperty()
  @IsEnum(StoreStatus)
  status: StoreStatus;
}
