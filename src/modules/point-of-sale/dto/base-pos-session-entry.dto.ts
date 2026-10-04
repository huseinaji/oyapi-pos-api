import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsString } from "class-validator";
import { PosSessionEntryStatus } from "../utils/pos.type";

export class BasePosSessionEntryDto {
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  storeId: string;
  @ApiProperty()
  @IsString()
  createdBy: string;
  @ApiProperty({ enum: PosSessionEntryStatus })
  @IsEnum(PosSessionEntryStatus)
  status: PosSessionEntryStatus;
  @ApiProperty()
  @IsString()
  closedBy: string;
}
