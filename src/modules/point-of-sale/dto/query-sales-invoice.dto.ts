import { IntersectionType, PartialType } from '@nestjs/swagger';
import { BaseSalesInvoiceDto } from './base-sales-invoice.dto';
import { BaseDateRangeQueryDto } from '../../../common/dto/datetime-query.dto';

export class QuerySalesInvoiceDto extends IntersectionType(
  PartialType(BaseSalesInvoiceDto),
  BaseDateRangeQueryDto,
) {}
