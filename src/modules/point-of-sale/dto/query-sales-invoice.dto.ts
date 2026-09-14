import { PartialType } from "@nestjs/swagger";
import { BaseSalesInvoiceDto } from "./base-sales-invoice.dto";

export class QuerySalesInvoiceDto extends PartialType(BaseSalesInvoiceDto) {}