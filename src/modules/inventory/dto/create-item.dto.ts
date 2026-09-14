import { ApiProperty, IntersectionType, PartialType, PickType } from "@nestjs/swagger";
import { BaseItemDto } from "./base-item.dto";
import { IsNumber, IsOptional, Min } from "class-validator";

const mandatoryFields = [
  'name',
  'category',
  'uom',
  'basePrice',
  'sellingPrice'
] as const;

export class CreateItemDto extends IntersectionType(
  PickType(BaseItemDto, mandatoryFields),
  PartialType(PickType(BaseItemDto, ['isMaintainStock', 'description'])),
) {
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Min(1)
  initialStock: number;
}
