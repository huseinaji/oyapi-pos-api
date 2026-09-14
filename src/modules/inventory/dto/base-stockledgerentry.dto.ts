import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsString } from "class-validator";
import { LedgerDirection } from "../utils/stock-ledger-entry.type";

export class BaseStockLedgerEntryDto {
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
}
