import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsString } from "class-validator";
import { LedgerDirection, LedgerReference, StockLedgerEntryStatus } from "../../utils/types/stock-ledger-entry.type";

export class BaseStockLedgerEntryDto {
  @ApiProperty()
  @IsString()
  storeId: string;

  @ApiProperty()
  @IsString()
  itemId: string;

  @ApiProperty()
  @IsNumber()
  qty: number;

  @ApiProperty()
  @IsEnum(LedgerDirection)
  ledgerDirection: LedgerDirection;

  @ApiProperty()
  @IsNumber()
  balanceAfter: number;

  @ApiProperty()
  @IsEnum(StockLedgerEntryStatus)
  status: StockLedgerEntryStatus;

  @ApiProperty()
  @IsEnum(LedgerReference)
  reference: LedgerReference;

  @ApiProperty()
  @IsString()
  referenceId: string;

  @ApiProperty()
  @IsString()
  remarks: string;
}
