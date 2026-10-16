import { PartialType } from '@nestjs/swagger';
import { PickType } from '@nestjs/swagger';
import { BaseItemDto } from './base-item.dto';

export class UpdateItemDto extends PartialType(
  PickType(BaseItemDto, [
    'name',
    'categoryId',
    'uom',
    'basePrice',
    'sellingPrice',
    'description',
    'status'
  ]),
) { }
