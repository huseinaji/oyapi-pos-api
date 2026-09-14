import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateSalesInvoiceItemDto } from './create-sales-invoice-item.dto';
import { PickType } from '@nestjs/swagger';
import { BaseSalesInvoiceDto } from './base-sales-invoice.dto';

export class CreatePOSTransactionDto extends PickType(BaseSalesInvoiceDto, ['paymentMethod', 'customer']) {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSalesInvoiceItemDto)
  items: CreateSalesInvoiceItemDto[];
}
