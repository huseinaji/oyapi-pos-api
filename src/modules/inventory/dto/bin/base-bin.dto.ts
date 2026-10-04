import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsString } from "class-validator";
import { ItemUOM } from "../../utils/types/item.type";

export class BaseBinDto {
  @ApiProperty()
  @IsString()
  itemId: string;

  @ApiProperty()
  @IsString()
  storeId: string;

  @ApiProperty()
  @IsNumber()
  qty: number;

  @ApiProperty()
  @IsNumber()
  reservedQty: number;

  @ApiProperty()
  @IsEnum(ItemUOM)
  uom: ItemUOM;
}
