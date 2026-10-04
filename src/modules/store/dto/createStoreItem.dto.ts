import { OmitType } from "@nestjs/swagger";
import { CreateItemDto } from "../../inventory/dto/items/create-item.dto";

export class CreateStoreItemDto extends OmitType(CreateItemDto, ['storeId']) { }
