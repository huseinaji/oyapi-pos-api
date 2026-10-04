import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsString } from "class-validator";
import { UserRole, UserStatus } from "../utils/user.types";

export class BaseUserDto {
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty()
  @IsEnum(UserStatus)
  status: UserStatus;

  @ApiProperty()
  @IsDateString()
  lastLogin: Date;
}
