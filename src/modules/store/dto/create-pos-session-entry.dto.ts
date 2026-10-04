import { ApiProperty } from "@nestjs/swagger";
import { ArrayUnique, IsArray, IsOptional, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { CreatePosSessionEntryItemDto } from "../../point-of-sale/dto/create-pos-session-entry-item.dto";

export class CreateStorePosSessionEntryDto {
  @ApiProperty({
    required: true,
    isArray: true,
    type: CreatePosSessionEntryItemDto,
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @ArrayUnique(
    (item: CreatePosSessionEntryItemDto) => item.itemId,
    { message: 'pos session opening item must be unique' },
  )
  @Type(() => CreatePosSessionEntryItemDto)
  items: CreatePosSessionEntryItemDto[];
}
