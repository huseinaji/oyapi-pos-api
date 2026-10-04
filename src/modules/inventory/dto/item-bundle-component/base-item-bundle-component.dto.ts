import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class BaseItemBundleComponentDto {
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  itemId: string;

  @ApiProperty()
  @IsString()
  componentItemId: string;

  @ApiProperty()
  @IsNumber()
  qty: number;
}