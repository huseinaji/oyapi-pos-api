import { PickType } from '@nestjs/swagger';
import { BaseStockLedgerEntryDto } from './base-stockledgerentry.dto';
import { ValidateIf } from 'class-validator';

export class CreateStockLedgerEntryDto extends PickType(
  BaseStockLedgerEntryDto,
  ['itemId', 'qty', 'ledgerDirection', 'storeId', 'reference', 'referenceId'],
) {
  @ValidateIf((o) => o.reference !== undefined)
  referenceId: string;
}
