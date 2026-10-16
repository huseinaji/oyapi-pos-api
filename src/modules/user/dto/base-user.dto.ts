import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsString } from "class-validator";
import { UserRole, UserStatus } from "../utils/user.types";

export class BaseUserDto {
  @ApiProperty({ type: String, description: 'Unique ID of the user', example: '01J8Q2M6K4N7P9R3T5V0W1X2YZ' })
  @IsString()
  id: string;

  @ApiProperty({ type: String, description: 'Unique username', example: 'jane.cashier' })
  @IsString()
  username: string;

  @ApiProperty({ type: String, format: 'email', description: 'User email address', example: 'jane@example.com' })
  @IsString()
  email: string;

  @ApiProperty({ type: String, format: 'password', description: 'Password supplied when creating the account; never returned by the API', writeOnly: true })
  @IsString()
  password: string;

  @ApiProperty({ enum: UserRole, enumName: 'UserRole', description: 'Global role assigned to the user' })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ enum: UserStatus, enumName: 'UserStatus', description: 'Whether the account is active' })
  @IsEnum(UserStatus)
  status: UserStatus;

  @ApiProperty({ type: String, format: 'date-time', description: 'Timestamp of the most recent successful login', example: '2026-10-05T08:30:00.000Z' })
  @IsDateString()
  lastLogin: Date;
}
