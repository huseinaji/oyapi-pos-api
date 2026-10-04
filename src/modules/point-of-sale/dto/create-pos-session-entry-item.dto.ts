import { PickType } from "@nestjs/swagger";
import { BasePosSessionEntryItemDto } from "./base-pos-session-entry-item.dto";

export class CreatePosSessionEntryItemDto extends PickType(BasePosSessionEntryItemDto, [
  'itemId',
  'openingQty',
]) { }

