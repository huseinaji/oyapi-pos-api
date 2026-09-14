import { PartialType } from '@nestjs/mapped-types';
import { BaseUserDto } from './base-user.dto';
import { IsEmpty, IsNotIn } from 'class-validator';
import { UserRole } from '../utils/user.types';

export class UpdateUserDto extends PartialType(BaseUserDto) {
  @IsEmpty()
  password: string;
  @IsNotIn([UserRole.ADMIN])
  role: UserRole;
}
