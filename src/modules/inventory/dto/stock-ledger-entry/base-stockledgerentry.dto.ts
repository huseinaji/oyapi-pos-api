import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsString } from "class-validator";
import { LedgerDirection, LedgerReference, StockLedgerEntryStatus } from "../../utils/types/stock-ledger-entry.type";

export class BaseStockLedgerEntryDto {
  @ApiProperty({ type: String, description: 'ID of the store where the movement occurred', example: '01J8Q2M6K4N7P9R3T5V0W1X2YZ' })
  @IsString()
  storeId: string;

  @ApiProperty({ type: String, description: 'ID of the item affected by the movement', example: '01J8Q2M6K4N7P9R3T5V0W1X2YZ' })
  @IsString()
  itemId: string;

  @ApiProperty({ type: Number, description: 'Quantity recorded by this movement', example: 5 })
  @IsNumber()
  qty: number;

  @ApiProperty({ enum: LedgerDirection, enumName: 'LedgerDirection', description: 'Whether stock is added to or removed from inventory' })
  @IsEnum(LedgerDirection)
  ledgerDirection: LedgerDirection;

  @ApiProperty({ type: Number, description: 'On-hand balance after this movement', example: 18 })
  @IsNumber()
  balanceAfter: number;

  @ApiProperty({ enum: StockLedgerEntryStatus, enumName: 'StockLedgerEntryStatus', description: 'Processing status of this stock movement' })
  @IsEnum(StockLedgerEntryStatus)
  status: StockLedgerEntryStatus;

  @ApiProperty({ enum: LedgerReference, enumName: 'LedgerReference', description: 'Source document type associated with this movement' })
  @IsEnum(LedgerReference)
  reference: LedgerReference;

  @ApiProperty({ type: String, description: 'ID of the source document associated with this movement', example: '01J8Q2M6K4N7P9R3T5V0W1X2YZ' })
  @IsString()
  referenceId: string;

  @ApiProperty({ type: String, description: 'Additional notes about the stock movement', example: 'Received from purchase order' })
  @IsString()
  remarks: string;
}
