import { PickType } from '@nestjs/swagger';
import { BaseUserDto } from "./base-user.dto";

const mandatoryFields = [
  'username',
  'email',
  'password'
] as const
export class CreateUserDto extends PickType(BaseUserDto, mandatoryFields) { }
