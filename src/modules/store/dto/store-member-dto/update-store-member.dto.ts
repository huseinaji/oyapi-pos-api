import { OmitType, PartialType } from '@nestjs/swagger';
import { BaseStoreMemberDto } from './base-store-member.dto';

export class UpdateStoreMemberDto extends PartialType(
  OmitType(BaseStoreMemberDto, ['isDefault', 'storeId']),
) {}
