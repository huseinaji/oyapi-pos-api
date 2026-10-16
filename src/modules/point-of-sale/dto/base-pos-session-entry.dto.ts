import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsString } from "class-validator";
import { PosSessionEntryStatus } from "../utils/pos.type";

export class BasePosSessionEntryDto {
  @ApiProperty({ type: String, description: 'ID of the POS session', example: '01J8Q2M6K4N7P9R3T5V0W1X2YZ' })
  @IsString()
  id: string;

  @ApiProperty({ type: String, description: 'ID of the store where the session was opened', example: '01J8Q2M6K4N7P9R3T5V0W1X2YZ' })
  @IsString()
  storeId: string;
  @ApiProperty({ type: String, description: 'ID of the user who opened the session', example: '01J8Q2M6K4N7P9R3T5V0W1X2YZ' })
  @IsString()
  createdBy: string;
  @ApiProperty({ enum: PosSessionEntryStatus, enumName: 'PosSessionEntryStatus', description: 'Current lifecycle status of the POS session' })
  @IsEnum(PosSessionEntryStatus)
  status: PosSessionEntryStatus;
  @ApiProperty({ type: String, description: 'ID of the user who closed the session', example: '01J8Q2M6K4N7P9R3T5V0W1X2YZ' })
  @IsString()
  closedBy: string;
}
