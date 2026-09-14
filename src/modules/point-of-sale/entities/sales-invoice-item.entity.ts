import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Table,
} from 'sequelize-typescript';
import { BaseModel } from '../../../common/base/base-model';
import { SalesInvoice } from './sales-invoice.entity';
import { Item } from '../../inventory/entities/item.entity';

@Table({
  timestamps: false,
})
export class SalesInvoiceItem extends BaseModel {
  @ForeignKey(() => SalesInvoice)
  @Column({ type: DataType.CHAR(26), allowNull: false })
  declare salesInvoiceId: string;

  @BelongsTo(() => SalesInvoice)
  declare salesInvoice: SalesInvoice;

  @ForeignKey(() => Item)
  @Column({ type: DataType.CHAR(26), allowNull: false })
  declare itemId: string;

  @BelongsTo(() => Item)
  declare item: Item;

  @Column({ type: DataType.NUMBER })
  declare qty: number;

  @Column({ type: DataType.NUMBER })
  declare amount: number;
}
