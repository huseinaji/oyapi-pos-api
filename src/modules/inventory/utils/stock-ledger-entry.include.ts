import { IncludeOptions } from "sequelize";
import { StockLedgerEntry } from "../entities/stock-ledger-entry.entity";

export function GET_STOCKLEDGERENTRY_INCLUDE(): IncludeOptions {
  return {
    model: StockLedgerEntry,
    required: false,
  }
}