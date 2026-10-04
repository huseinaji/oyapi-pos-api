import { OmitType, PartialType } from "@nestjs/swagger";
import { BasePosSessionEntryDto } from "./base-pos-session-entry.dto";

export class QueryPosSessionEntryDto extends PartialType(
  OmitType(BasePosSessionEntryDto, ['id', 'storeId'])) { }
