import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class BaseItemBundleComponentDto {
  @ApiProperty({ type: String, description: 'ID of the bundle component record', example: '01J8Q2M6K4N7P9R3T5V0W1X2YZ' })
  @IsString()
  id: string;

  @ApiProperty({ type: String, description: 'ID of the bundle item', example: '01J8Q2M6K4N7P9R3T5V0W1X2YZ' })
  @IsString()
  itemId: string;

  @ApiProperty({ type: String, description: 'ID of the item included in the bundle', example: '01J8Q2M6K4N7P9R3T5V0W1X2YZ' })
  @IsString()
  componentItemId: string;

  @ApiProperty({ type: Number, description: 'Quantity of the component included in one bundle', example: 2, minimum: 1 })
  @IsNumber()
  qty: number;
}