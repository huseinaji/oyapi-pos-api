import { PartialType } from "@nestjs/swagger";
import { BaseItemDto } from "./base-item.dto";

export class QueryItemDto extends PartialType(BaseItemDto) {}