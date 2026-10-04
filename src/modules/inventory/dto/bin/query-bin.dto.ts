import { OmitType, PartialType } from "@nestjs/swagger";
import { BaseBinDto } from "./base-bin.dto";

export class QueryBinDto extends PartialType(
  OmitType(BaseBinDto, ['storeId'])
) { }
