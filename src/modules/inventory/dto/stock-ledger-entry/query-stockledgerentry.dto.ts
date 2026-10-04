import { PartialType } from '@nestjs/mapped-types';
import { BaseStockLedgerEntryDto } from './base-stockledgerentry.dto';
import { OmitType } from '@nestjs/swagger';

export class QueryStockLedgerEntryDto extends PartialType(
  OmitType(BaseStockLedgerEntryDto, ['storeId']),
) { }
