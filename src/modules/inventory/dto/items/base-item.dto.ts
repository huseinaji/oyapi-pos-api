import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsNumber, IsString } from "class-validator";
import { ItemStatus, ItemType, ItemUOM } from "../../utils/types/item.type";

export class BaseItemDto {
  @ApiProperty()
  @IsString()
  storeId: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsEnum(ItemStatus)
  status: ItemStatus;

  @ApiProperty()
  @IsEnum(ItemType)
  type: ItemType;

  @ApiProperty()
  @IsString()
  categoryId: string;

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
