import { ApiProperty } from "@nestjs/swagger";
import { IsPhoneNumber, IsString } from "class-validator";

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
}
