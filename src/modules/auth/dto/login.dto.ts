import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsString } from "class-validator";

export class LoginDto {
  @ApiProperty()
  @IsString()
  usernameOrEmail: string;
  @ApiProperty()
  @IsString()
  password: string;
  @ApiProperty()
  @IsBoolean()
  rememberMe: boolean;
}
