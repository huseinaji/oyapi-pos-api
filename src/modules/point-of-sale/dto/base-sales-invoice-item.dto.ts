import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class BaseSalesInvoiceItemDto {
  @ApiProperty({ type: String, description: 'ID of the sales invoice line', example: '01J8Q2M6K4N7P9R3T5V0W1X2YZ' })
  @IsString()
  id: string;
  @ApiProperty({ type: String, description: 'ID of the parent sales invoice', example: '01J8Q2M6K4N7P9R3T5V0W1X2YZ' })
  @IsString()
  salesInvoiceId: string;
  @ApiProperty({ type: String, description: 'ID of the item sold', example: '01J8Q2M6K4N7P9R3T5V0W1X2YZ' })
  @IsString()
  itemId: string;
  @ApiProperty({ type: Number, description: 'Quantity sold', example: 2, minimum: 1 })
  @IsNumber()
  qty: number;
  @ApiProperty({ type: Number, description: 'Line total for this item in the invoice currency', example: 120000, minimum: 0 })
  @IsNumber()
  amount: number;
}
