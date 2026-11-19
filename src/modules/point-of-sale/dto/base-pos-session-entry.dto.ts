import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsInt, IsNumber, IsString, Min } from "class-validator";
import { PosSessionEntryStatus } from "../utils/pos.type";
import { Type } from "class-transformer";

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
  @ApiProperty({ type: Number, description: 'Cash placed in the drawer when opening the session', example: 200000, minimum: 0 })
  @IsNumber()
  openingCash: number;

  @ApiProperty({
    type: Number,
    description: 'Physical cash counted at closing',
    minimum: 0,
    example: 2150000,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  actualCash: number;

  @ApiProperty({
    type: String,
    description: 'Explanation for any cash or stock variance',
  })
  @IsString()
  remarks: string;

  @ApiProperty({ enum: PosSessionEntryStatus, enumName: 'PosSessionEntryStatus', description: 'Current lifecycle status of the POS session' })
  @IsEnum(PosSessionEntryStatus)
  status: PosSessionEntryStatus;
  @ApiProperty({ type: String, description: 'ID of the user who closed the session', example: '01J8Q2M6K4N7P9R3T5V0W1X2YZ' })
  @IsString()
  closedBy: string;
}
