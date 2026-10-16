import { ApiProperty } from '@nestjs/swagger';
import { IsString } from "class-validator";

export class AssignMmeberStoreDto {
  @ApiProperty({ type: String, description: 'ID of the user to add to the store', example: '01J8Q2M6K4N7P9R3T5V0W1X2YZ' })
  @IsString()
  userId: string;
}
