import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsNumber, IsString } from "class-validator";
import { ItemStatus, ItemType, ItemUOM } from "../../utils/types/item.type";

export class BaseItemDto {
  @ApiProperty({ type: String, description: 'ID of the store that owns this item', example: 'store_01J8Q2M6K4N7P9R3T5V0W1X2YZ' })
  @IsString()
  storeId: string;

  @ApiProperty({ type: String, description: 'Display name of the item', example: 'Arabica Coffee 250g' })
  @IsString()
  name: string;

  @ApiProperty({ enum: ItemStatus, description: 'Current availability status of the item' })
  @IsEnum(ItemStatus)
  status: ItemStatus;

  @ApiProperty({ enum: ItemType, description: 'Whether the item is a regular item or a bundle' })
  @IsEnum(ItemType)
  type: ItemType;

  @ApiProperty({ type: String, description: 'ID of the item category', example: 'category_01J8Q2M6K4N7P9R3T5V0W1X2YZ' })
  @IsString()
  categoryId: string;

  @ApiProperty({ type: String, description: 'Additional details about the item', example: 'Single-origin coffee beans' })
  @IsString()
  description: string;

  @ApiProperty({ enum: ItemUOM, description: 'Unit used to measure or sell this item' })
  @IsEnum(ItemUOM)
  uom: ItemUOM;

  @ApiProperty({ type: Number, description: 'Cost or acquisition price per unit', example: 45000 })
  @IsNumber()
  basePrice: number;

  @ApiProperty({ type: Number, description: 'Selling price per unit', example: 60000 })
  @IsNumber()
  sellingPrice: number;

  @ApiProperty({ type: Boolean, description: 'Whether stock quantities are tracked for this item', example: true })
  @IsBoolean()
  isMaintainStock: boolean;
}
