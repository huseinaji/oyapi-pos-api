import {
  BeforeCreate,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Table,
} from 'sequelize-typescript';
import { BaseModel } from '../../../common/base/base-model';
import { User } from '../../user/entities/user.entity';
import { SalesInvoiceItem } from './sales-invoice-item.entity';
import { PaymentMethod, SalesInvoiceStatus } from '../utils/pos.type';
import { genInvoiceId } from '../utils/sales-invoice.helper';
import { Store } from '../../store/entities/store.entity';
import { PosSessionEntry } from './pos-session-entry.entity';

@Table({
  timestamps: true,
  paranoid: true,
})
export class SalesInvoice extends BaseModel {
  @ForeignKey(() => Store)
  declare storeId: string;

  @BelongsTo(() => Store)
  declare store: Store;

  @ForeignKey(() => PosSessionEntry)
  declare posSessionId: string;

  @BelongsTo(() => PosSessionEntry)
  declare posSession: PosSessionEntry;

  @Column({ type: DataType.STRING, unique: true })
  declare invoiceId: string;

  @Column({ type: DataType.STRING, allowNull: false, defaultValue: 'Walk in Customer' })
  declare customer: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare paymentMethod: PaymentMethod;

  @Column({ type: DataType.NUMBER, allowNull: false, defaultValue: 0 })
  declare totalAmount: number;

  @Column({ type: DataType.STRING, defaultValue: SalesInvoiceStatus.PENDING })
  declare status: string;

  @ForeignKey(() => User)
  declare createdBy: string;

  @BelongsTo(() => User, { as: 'creator' })
  declare creator: User;

  @Column({ type: DataType.CHAR(26), allowNull: true })
  declare updatedBy: string;

  @BelongsTo(() => User, { as: 'updator' })
  declare updator: User;

  @HasMany(() => SalesInvoiceItem)
  declare salesInvoiceItems: SalesInvoiceItem[];

  @BeforeCreate
  static setInvoiceId(instance: SalesInvoice) {
    instance.invoiceId = genInvoiceId();
  }
}
