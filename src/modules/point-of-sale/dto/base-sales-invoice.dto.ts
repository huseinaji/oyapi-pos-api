import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString } from 'class-validator';
import { PaymentMethod, SalesInvoiceStatus } from '../utils/pos.type';

export class BaseSalesInvoiceDto {
  @IsString()
  id: string;
  @ApiProperty()
  @IsString()
  userId: string;
  @ApiProperty()
  @IsString()
  customer: string;
  @ApiProperty()
  @IsString()
  invoiceId: string;
  @ApiProperty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
  @ApiProperty()
  @IsNumber()
  totalAmount: number;
  @ApiProperty()
  @IsEnum(SalesInvoiceStatus)
  status: SalesInvoiceStatus;
  @ApiProperty()
  @IsString()
  createdBy: string;
  @ApiProperty()
  @IsString()
  updatedBy: string;
}
