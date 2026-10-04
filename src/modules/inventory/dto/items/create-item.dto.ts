import {
  ApiProperty,
  IntersectionType,
  PartialType,
  PickType,
} from '@nestjs/swagger';
import { BaseItemDto } from './base-item.dto';
import {
  IsArray,
  ArrayUnique,
  IsEmpty,
  IsNumber,
  Min,
  ValidateIf,
  ValidateNested,
  IsBoolean,
  Max,
  ArrayMaxSize,
} from 'class-validator';
import { ItemType } from '../../utils/types/item.type';
import { CreateItemBundleComponentDto } from '../item-bundle-component/create-item-bundle-component.dto';
import { Type } from 'class-transformer';

const mandatoryFields = [
  'name',
  'type',
  'uom',
  'basePrice',
  'sellingPrice',
  'storeId',
  'isMaintainStock',
] as const;

export class CreateItemDto extends IntersectionType(
  PickType(BaseItemDto, mandatoryFields),
  PartialType(PickType(BaseItemDto, ['description', 'categoryId'])),
) {
  @ApiProperty()
  @IsEmpty({ validateIf: (o) => o.type === ItemType.ITEM_BUNDLE })
  @ValidateIf((o) => o.type !== ItemType.ITEM_BUNDLE)
  @IsNumber()
  @Min(1)
  initialStock: number;

  @ValidateIf(o => o.type !== ItemType.ITEM_BUNDLE)
  @IsBoolean()
  @Type(() => Boolean)
  isMaintainStock: boolean;

  @ApiProperty({ isArray: true })
  @ValidateIf(o => o.type === ItemType.ITEM_BUNDLE)
  @IsArray()
  @ArrayUnique(
    (component: CreateItemBundleComponentDto) => component.componentItemId,
    { message: 'componentItemId must be unique within itemComponents' },
  )
  @ValidateNested({ each: true })
  @ArrayMaxSize(1, { message: 'multiple item components feature are cooming very soon' })
  @Type(() => CreateItemBundleComponentDto)
  itemComponents: CreateItemBundleComponentDto[];
}
