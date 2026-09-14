import { PickType } from "@nestjs/swagger";
import { BaseSalesInvoiceItemDto } from "./base-sales-invoice-item.dto";

export class CreateSalesInvoiceItemDto extends PickType(BaseSalesInvoiceItemDto, ['itemId', 'qty']) { }
