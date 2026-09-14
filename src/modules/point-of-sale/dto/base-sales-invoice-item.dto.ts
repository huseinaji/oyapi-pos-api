import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class BaseSalesInvoiceItemDto {
  @ApiProperty()
  @IsString()
  id: string;
  @ApiProperty()
  @IsString()
  salesInvoiceId: string;
  @ApiProperty()
  @IsString()
  itemId: string;
  @ApiProperty()
  @IsNumber()
  qty: number;
  @ApiProperty()
  @IsNumber()
  amount: number;
}
