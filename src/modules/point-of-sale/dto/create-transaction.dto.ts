import { ArrayUnique, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateSalesInvoiceItemDto } from './create-sales-invoice-item.dto';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { BaseSalesInvoiceDto } from './base-sales-invoice.dto';

export class CreatePOSTransactionDto extends PickType(BaseSalesInvoiceDto, [
  'paymentMethod',
  'customer',
  'storeId',
  'posSessionId'
]) {
  @ApiProperty({
    required: true,
    isArray: true,
    type: () => CreateSalesInvoiceItemDto,
    description: 'Items included in the sale. Each item ID must be unique within the transaction.',
    example: [{ itemId: '01J8Q2M6K4N7P9R3T5V0W1X2YZ', qty: 2 }],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayUnique((item: CreateSalesInvoiceItemDto) => item.itemId)
  @Type(() => CreateSalesInvoiceItemDto)
  items: CreateSalesInvoiceItemDto[];
}
