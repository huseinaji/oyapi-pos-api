import { IntersectionType, OmitType, PartialType, PickType } from "@nestjs/swagger";
import { BaseStoreDto } from "./base-store.dto";

export class CreateStoreDto extends IntersectionType(
  PickType(BaseStoreDto, ['name']),
  PartialType(OmitType(BaseStoreDto, ['name', 'status']))
) { }
