import { OmitType, PartialType } from "@nestjs/swagger";
import { BaseStoreDto } from "./base-store.dto";

export class UpdateStoreDto extends
  PartialType(
    OmitType(BaseStoreDto, ['status'])
  ) { }
