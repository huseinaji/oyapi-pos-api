import { PickType } from "@nestjs/swagger";
import { BaseItemBundleComponentDto } from "./base-item-bundle-component.dto";
import { Min } from "class-validator";

export class CreateItemBundleComponentDto extends PickType(
  BaseItemBundleComponentDto,
  ['componentItemId', 'qty'],
) {
  
  @Min(1)
  qty: number;
}