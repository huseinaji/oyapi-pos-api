import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString } from 'class-validator';
import { PaymentMethod, SalesInvoiceStatus } from '../utils/pos.type';

export class BaseSalesInvoiceDto {
  @ApiProperty({ type: String, description: 'ID of the sales invoice', example: '01J8Q2M6K4N7P9R3T5V0W1X2YZ' })
  @IsString()
  id: string;
  @ApiProperty({ type: String, description: 'ID of the store where the sale was made', example: '01J8Q2M6K4N7P9R3T5V0W1X2YZ' })
  @IsString()
  storeId: string;
  @ApiProperty({ type: String, description: 'ID of the POS session for this sale', example: '01J8Q2M6K4N7P9R3T5V0W1X2YZ' })
  @IsString()
  posSessionId: string;
  @ApiProperty({ type: String, description: 'Customer name or reference supplied for the sale', example: 'Walk-in customer' })
  @IsString()
  customer: string;
  @ApiProperty({ type: String, description: 'Human-readable invoice number', example: 'INV-20261005-0001' })
  @IsString()
  invoiceId: string;
  @ApiProperty({ enum: PaymentMethod, enumName: 'PaymentMethod', description: 'Payment method used for the sale' })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
  @ApiProperty({ type: Number, description: 'Total amount charged for the invoice', example: 120000, minimum: 0 })
  @IsNumber()
  totalAmount: number;
  @ApiProperty({ enum: SalesInvoiceStatus, enumName: 'SalesInvoiceStatus', description: 'Current processing status of the invoice' })
  @IsEnum(SalesInvoiceStatus)
  status: SalesInvoiceStatus;
  @ApiProperty({ type: String, description: 'ID of the user who created the invoice', example: '01J8Q2M6K4N7P9R3T5V0W1X2YZ' })
  @IsString()
  createdBy: string;
  @ApiProperty({ type: String, description: 'ID of the user who last updated the invoice', example: '01J8Q2M6K4N7P9R3T5V0W1X2YZ' })
  @IsString()
  updatedBy: string;
}
