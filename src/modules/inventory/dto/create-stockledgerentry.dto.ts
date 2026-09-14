import { PickType } from "@nestjs/swagger";
import { BaseStockLedgerEntryDto } from "./base-stockledgerentry.dto";

export class CreateStockLedgerEntryDto extends PickType(BaseStockLedgerEntryDto, ['itemId', 'qty', 'ledgerDirection']) { }
