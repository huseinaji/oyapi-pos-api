import { PartialType } from "@nestjs/swagger";
import { BaseStoreDto } from "./base-store.dto";
import { OmitType } from '@nestjs/swagger';

export class QueryStoreDto extends
  PartialType(
    OmitType(BaseStoreDto, ['imageUrl'])
  ) { }
