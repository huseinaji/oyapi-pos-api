import { OmitType, PartialType, PickType } from '@nestjs/swagger';
import { BaseUserDto } from './base-user.dto';

export class QueryUserDto extends PartialType(OmitType(BaseUserDto, ['id'])) {}

export class QueryListUserDto extends PickType(BaseUserDto, ['username']) {}
