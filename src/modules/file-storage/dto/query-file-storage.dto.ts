import { PartialType, PickType } from '@nestjs/swagger';
import { BaseFileStorageDto } from './base-file-storage.dto';

export class QueryFileStorageDto extends PartialType(
  PickType(BaseFileStorageDto, ['objectKey', 'mimeType', 'status']),
) {}
