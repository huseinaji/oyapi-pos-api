import { PartialType } from '@nestjs/mapped-types';
import { BaseStockLedgerEntryDto } from './base-stockledgerentry.dto';

export class QueryStockLedgerEntryDto extends PartialType(
  BaseStockLedgerEntryDto,
) {}
