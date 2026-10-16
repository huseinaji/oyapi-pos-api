import { ApiProperty } from "@nestjs/swagger";
import { ArrayUnique, IsArray, IsOptional, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { CreatePosSessionEntryItemDto } from "../../point-of-sale/dto/create-pos-session-entry-item.dto";

export class CreateStorePosSessionEntryDto {
  @ApiProperty({
    required: false,
    isArray: true,
    type: () => CreatePosSessionEntryItemDto,
    description: 'Optional opening stock counts for items in this POS session.',
    example: [{ itemId: '01J8Q2M6K4N7P9R3T5V0W1X2YZ', openingQty: 12 }],
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
