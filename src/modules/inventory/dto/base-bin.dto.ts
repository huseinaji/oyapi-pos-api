import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsString } from "class-validator";
import { ItemUOM } from "../utils/item.types";

export class BaseBinDto {
  @ApiProperty()
  @IsString()
  itemId: string;
  
  @ApiProperty()
  @IsNumber()
  stockValue: number;

  @ApiProperty()
  @IsEnum(ItemUOM)
  uom: ItemUOM;
}