import { IsEnum, IsString } from "class-validator";
import { StockAdjustmentType } from "../../utils/types/stock-adjustment.type";
import { ApiProperty } from "@nestjs/swagger";

export class BaseStockAdjustmentDto {
  @IsString()
  id: string;

  @ApiProperty()
  @IsEnum(StockAdjustmentType)
  type: StockAdjustmentType;

  @ApiProperty()
  remarks: string;
}
