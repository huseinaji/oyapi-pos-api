import {
  ApiProperty,
  IntersectionType,
  PartialType,
  PickType,
} from '@nestjs/swagger';
import { BasePosSessionEntryDto } from './base-pos-session-entry.dto';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BasePosSessionEntryItemDto } from './base-pos-session-entry-item.dto';

export class ClosePosSessionItemDto extends PickType(
  BasePosSessionEntryItemDto,
  ['itemId', 'actualQty'],
) {}

export class ClosePosSessionEntryDto extends IntersectionType(
  PickType(BasePosSessionEntryDto, ['actualCash']),
  PartialType(PickType(BasePosSessionEntryDto, ['remarks'])),
) {
  @ApiProperty({
    type: () => [ClosePosSessionItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClosePosSessionItemDto)
  items: ClosePosSessionItemDto[];
}
