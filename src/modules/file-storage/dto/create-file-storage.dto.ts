import { PickType } from '@nestjs/swagger';
import { BaseFileStorageDto } from './base-file-storage.dto';

export class CreateFileStorageDto extends PickType(BaseFileStorageDto, [
  'objectKey',
  'mimeType',
  'status',
]) {}
