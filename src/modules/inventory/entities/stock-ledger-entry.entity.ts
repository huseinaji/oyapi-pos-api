import { BelongsTo, Column, DataType, ForeignKey, Table } from "sequelize-typescript";
import { BaseModel } from "../../../common/base/base-model";
import { LedgerDirection, StockLedgerEntryStatus } from "../utils/stock-ledger-entry.type";
import { Item } from "./item.entity";

@Table({
  timestamps: true,
})
export class StockLedgerEntry extends BaseModel {
  // @ForeignKey(() => Store)
  // @Column({ type: DataType.STRING(26), allowNull: false})
  // declare storeId: string;
  // 
  // @BelongsTo(() => Store)
  // declare store: Store;

  @ForeignKey(() => Item)
  @Column({ type: DataType.STRING })
  declare itemId: string;

  @BelongsTo(() => Item)
  declare item: Item;

  @Column({ type: DataType.INTEGER })
  declare qty: number;

  @Column({ type: DataType.STRING, defaultValue: LedgerDirection.IN })
  declare ledgerDirection: LedgerDirection;

  @Column({ type: DataType.INTEGER })
  declare balanceAfter: number;

  @Column({ type: DataType.STRING, defaultValue: StockLedgerEntryStatus.ACTIVE })
  declare status: StockLedgerEntryStatus;
}
