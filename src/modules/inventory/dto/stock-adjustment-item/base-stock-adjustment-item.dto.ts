import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class BaseStockAdjustmentItemDto {
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  stockAdjustmentId: string;

  @ApiProperty()
  @IsString()
  itemId: string;

  @ApiProperty()
  @IsNumber()
  qty: number;
}
