import { ApiProperty, IntersectionType, PartialType, PickType } from "@nestjs/swagger";
import { BaseStockAdjustmentDto } from "./base-stock-adjustment.dto";
import { ArrayMinSize, ArrayUnique, IsArray, ValidateNested } from "class-validator";
import { CreateStockAdjustmentItemDto } from "../stock-adjustment-item/create-stock-adjustment-item.dto";
import { Type } from "class-transformer";

export class CreateStockAdjustmentDto extends IntersectionType(
  PickType(
    BaseStockAdjustmentDto, ['type']
  ),
  PartialType(
    PickType(
      BaseStockAdjustmentDto, ['remarks']
    )
  )
) {
  @ApiProperty({ isArray: true, })
  @ValidateNested({ each: true })
  @IsArray()
  @ArrayMinSize(1)
  @Type(() => CreateStockAdjustmentItemDto)
  @ArrayUnique((item: CreateStockAdjustmentItemDto) => item.itemId)
  items: CreateStockAdjustmentItemDto[]
}
