import { PickType } from "@nestjs/mapped-types";
import { BaseUserDto } from "./base-user.dto";

const mandatoryFields = [
  'username',
  'email',
  'password'
] as const
export class CreateUserDto extends PickType(BaseUserDto, mandatoryFields) { }
