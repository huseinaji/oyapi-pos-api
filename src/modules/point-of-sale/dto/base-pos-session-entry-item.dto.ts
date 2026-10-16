import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class BasePosSessionEntryItemDto {
  @ApiProperty({ type: String, description: 'ID of the POS session line', example: '01J8Q2M6K4N7P9R3T5V0W1X2YZ' })
  @IsString()
  id: string;
  @ApiProperty({ type: String, description: 'ID of the POS session', example: '01J8Q2M6K4N7P9R3T5V0W1X2YZ' })
  @IsString()
  posSessionId: string;
  @ApiProperty({ type: String, description: 'ID of the inventory item', example: '01J8Q2M6K4N7P9R3T5V0W1X2YZ' })
  @IsString()
  itemId: string;
  @ApiProperty({ type: Number, description: 'Quantity counted when the session opened', example: 20, minimum: 0 })
  @IsNumber()
  openingQty: number;
  @ApiProperty({ type: Number, description: 'Quantity counted when the session closed', example: 15, minimum: 0 })
  @IsNumber()
  closingQty: number;

  @ApiProperty({ type: Number, description: 'Quantity sold during the session', example: 5, minimum: 0 })
  @IsNumber()
  soldQty: number;
}
