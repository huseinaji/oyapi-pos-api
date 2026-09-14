import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsNumber, IsString } from "class-validator";
import { ItemCategory, ItemUOM } from "../utils/item.types";

export class BaseItemDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsEnum(ItemCategory)
  category: ItemCategory;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsEnum(ItemUOM)
  uom: ItemUOM;

  @ApiProperty()
  @IsNumber()
  basePrice: number;

  @ApiProperty()
  @IsNumber()
  sellingPrice: number;

  @ApiProperty()
  @IsBoolean()
  isMaintainStock: boolean;
}
