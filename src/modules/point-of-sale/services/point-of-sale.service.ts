import { Injectable } from '@nestjs/common';
import { accessTokenPayload } from '../../auth/utils/auth.type';
import { CreatePOSTransactionDto } from '../dto/create-transaction.dto';
import { SalesInvoiceService } from './sales-invoice.service';
import { Sequelize } from 'sequelize-typescript';
import { SalesInvoiceItemService } from './sales-invoice-item.service';
import { SalesInvoiceItem } from '../entities/sales-invoice-item.entity';
import { StockLedgerEntryService } from '../../inventory/services/stock-ledger-entry.service';
import { LedgerDirection } from '../../inventory/utils/stock-ledger-entry.type';
import { TxOptions } from '../../../common/base/base.service';

@Injectable()
export class PointOfsaleService {
  constructor(
    private readonly salesInvoiceService: SalesInvoiceService,
    private readonly salesInvoiceItemService: SalesInvoiceItemService,
    private readonly stockLedgerEntryService: StockLedgerEntryService,
    private sequelize: Sequelize,
  ) { }

  calculateTotalAmount(items: SalesInvoiceItem[]): number {
    const amountMap = items.map((item) => item.amount);
    return amountMap.reduce((acc, currVal) => acc + currVal, 0);
  }

  async createTransaction(
    data: CreatePOSTransactionDto,
    user: accessTokenPayload,
  ) {
    return this.sequelize.transaction(async (t) => {
      const tx = { transaction: t };

      const invoice = await this.salesInvoiceService.create(
        {
          createDto: {
            paymentMethod: data.paymentMethod,
            userId: user.sub,
            customer: data.customer,
          },
          user,
        },
        tx,
      );

      const invoiceItems = await this.salesInvoiceItemService.generateFromSI(
        invoice.id,
        data.items,
        tx,
      );

      invoice.totalAmount = this.calculateTotalAmount(invoiceItems);
      await invoice.save(tx);

      await this.createStockLedger(invoiceItems, tx);

      return invoice;
    });
  }

  async createStockLedger(invoiceItems: SalesInvoiceItem[], options?: TxOptions) {
    await Promise.all(
      invoiceItems.map(async item => {
        await this.stockLedgerEntryService.create({
          createDto: {
            itemId: item.itemId,
            qty: item.qty,
            ledgerDirection: LedgerDirection.OUT
          }
        }, options);
      })
    )
  }

  async findByInvoice(invoiceId: string, user: accessTokenPayload) {
    await this.salesInvoiceService.findOne({ id: invoiceId, user });
  }
}
