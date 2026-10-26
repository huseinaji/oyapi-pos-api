import { PartialType } from '@nestjs/swagger';
import { OmitType } from '@nestjs/swagger';
import { BaseStoreDto } from './store-dto/base-store.dto';

export class QueryStoreDto extends PartialType(
  OmitType(BaseStoreDto, ['imageUrl']),
) {}
