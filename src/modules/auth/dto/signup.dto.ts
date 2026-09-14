import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsString, IsStrongPassword } from "class-validator";
import { UserRole } from "../../user/utils/user.types";

export class SignupDto {
  @ApiProperty()
  @IsString()
  username: string;
  @ApiProperty()
  @IsEmail()
  email: string;
  @ApiProperty()
  @IsStrongPassword()
  password: string;
  @ApiProperty()
  @IsEnum(UserRole)
  role: UserRole;
}