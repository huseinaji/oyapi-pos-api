import { PickType } from "@nestjs/swagger";
import { BaseStockAdjustmentItemDto } from "./base-stock-adjustment-item.dto";

export class CreateStockAdjustmentItemDto extends PickType(
  BaseStockAdjustmentItemDto, ['itemId', 'qty']
) { }
