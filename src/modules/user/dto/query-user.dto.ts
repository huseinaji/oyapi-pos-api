import { OmitType, PartialType } from "@nestjs/swagger";
import { BaseUserDto } from "./base-user.dto";

export class QueryUserDto extends PartialType(OmitType(BaseUserDto, ['id'])) { }
