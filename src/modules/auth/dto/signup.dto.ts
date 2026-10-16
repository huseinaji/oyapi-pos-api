import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsString, IsStrongPassword } from "class-validator";
import { UserRole } from "../../user/utils/user.types";

export class SignupDto {
  @ApiProperty({ type: String, description: 'Unique username for the new account', example: 'jane.cashier' })
  @IsString()
  username: string;
  @ApiProperty({ type: String, format: 'email', description: 'Email address for the new account', example: 'jane@example.com' })
  @IsEmail()
  email: string;
  @ApiProperty({ type: String, format: 'password', description: 'Password that meets the configured strong-password policy', example: 'StrongPassword123!' })
  @IsStrongPassword()
  password: string;
  @ApiProperty({ enum: UserRole, enumName: 'UserRole', description: 'Role assigned to the new account' })
  @IsEnum(UserRole)
  role: UserRole;
}