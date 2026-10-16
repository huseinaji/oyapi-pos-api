import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsString } from "class-validator";
import { ItemUOM } from "../../utils/types/item.type";

export class BaseBinDto {
  @ApiProperty({ type: String, description: 'ID of the inventory item', example: '01J8Q2M6K4N7P9R3T5V0W1X2YZ' })
  @IsString()
  itemId: string;

  @ApiProperty({ type: String, description: 'ID of the store holding this inventory', example: '01J8Q2M6K4N7P9R3T5V0W1X2YZ' })
  @IsString()
  storeId: string;

  @ApiProperty({ type: Number, description: 'Current on-hand quantity', example: 24, minimum: 0 })
  @IsNumber()
  qty: number;

  @ApiProperty({ type: Number, description: 'Quantity reserved and unavailable for new sales', example: 3, minimum: 0 })
  @IsNumber()
  reservedQty: number;

  @ApiProperty({ enum: ItemUOM, enumName: 'ItemUOM', description: 'Unit used for the inventory quantity' })
  @IsEnum(ItemUOM)
  uom: ItemUOM;
}
