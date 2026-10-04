import { PickType } from "@nestjs/swagger";
import { Min } from 'class-validator';
import { BaseSalesInvoiceItemDto } from "./base-sales-invoice-item.dto";

export class CreateSalesInvoiceItemDto extends
  PickType(
    BaseSalesInvoiceItemDto, [
    'itemId',
    'qty'
  ]) {
  @Min(1)
  qty: number;
}

