import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class BasePosSessionEntryItemDto {
  @IsString()
  id: string;
  @ApiProperty()
  @IsString()
  posSessionId: string;
  @ApiProperty()
  @IsString()
  itemId: string;
  @ApiProperty()
  @IsNumber()
  openingQty: number;
  @ApiProperty()
  @IsNumber()
  closingQty: number;

  @ApiProperty()
  @IsNumber()
  soldQty: number;
}
