import { BelongsTo, Column, DataType, ForeignKey, Table } from "sequelize-typescript";
import { BaseModel } from "../../../common/base/base-model";
import { LedgerDirection, LedgerReference, StockLedgerEntryStatus } from "../utils/types/stock-ledger-entry.type";
import { Item } from "./item.entity";
import { Store } from "../../store/entities/store.entity";
import { SalesInvoice } from "../../point-of-sale/entities/sales-invoice.entity";

@Table({
  timestamps: true,
  paranoid: true,
})
export class StockLedgerEntry extends BaseModel {
  @ForeignKey(() => Store)
  declare storeId: string;

  @BelongsTo(() => Store)
  declare store: Store;

  @ForeignKey(() => Item)
  declare itemId: string;

  @BelongsTo(() => Item)
  declare item: Item;

  @Column({ type: DataType.STRING, allowNull: true })
  declare reference: LedgerReference;

  @Column({ type: DataType.STRING })
  declare referenceId: string;

  @BelongsTo(() => SalesInvoice, {
    constraints: false,
    as: 'refData',
    foreignKey: 'referenceId'
  })
  declare salesInvoice: SalesInvoice

  @Column({ type: DataType.STRING })
  declare remarks: string;

  @Column({ type: DataType.INTEGER })
  declare qty: number;

  @Column({ type: DataType.STRING, defaultValue: LedgerDirection.IN })
  declare ledgerDirection: LedgerDirection;

  @Column({ type: DataType.INTEGER })
  declare balanceAfter: number;

  @Column({ type: DataType.STRING, defaultValue: StockLedgerEntryStatus.ACTIVE })
  declare status: StockLedgerEntryStatus;
}
