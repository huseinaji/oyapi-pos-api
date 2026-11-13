import { IntersectionType, PartialType, PickType } from '@nestjs/swagger';
import { BaseStockLedgerEntryDto } from './base-stockledgerentry.dto';
import { ValidateIf } from 'class-validator';

export class CreateStockLedgerEntryDto extends IntersectionType(
  PickType(BaseStockLedgerEntryDto, [
    'itemId',
    'qty',
    'ledgerDirection',
    'storeId',
  ]),
  PartialType(PickType(BaseStockLedgerEntryDto, ['reference', 'referenceId'])),
) {
  @ValidateIf((o) => o.reference !== undefined)
  referenceId?: string;
}
