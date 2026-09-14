import { OmitType } from "@nestjs/swagger";
import { BaseStoreDto } from "./base-store.dto";

export class CreateStoreDto extends OmitType(BaseStoreDto, ['name']) { }
