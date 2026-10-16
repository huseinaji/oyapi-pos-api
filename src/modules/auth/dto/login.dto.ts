import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsString } from "class-validator";

export class LoginDto {
  @ApiProperty({ type: String, description: 'Username or email address used to sign in', example: 'cashier@example.com' })
  @IsString()
  usernameOrEmail: string;
  @ApiProperty({ type: String, format: 'password', description: 'Account password', example: 'StrongPassword123!' })
  @IsString()
  password: string;
  @ApiProperty({ type: Boolean, description: 'Whether to keep the session active for an extended period', example: true })
  @IsBoolean()
  rememberMe: boolean;
}
