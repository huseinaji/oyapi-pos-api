import { BadRequestException, Injectable } from '@nestjs/common';
import { UserAuthPayload } from '../../auth/utils/auth.type';
import { CreatePOSTransactionDto } from '../dto/create-transaction.dto';
import { SalesInvoiceService } from './sales-invoice.service';
import { Sequelize } from 'sequelize-typescript';
import { SalesInvoiceItemService } from './sales-invoice-item.service';
import { SalesInvoiceItem } from '../entities/sales-invoice-item.entity';
import { PosSessionEntryService } from './pos-session-entry.service';

@Injectable()
export class PointOfsaleService {
  constructor(
    private readonly salesInvoiceService: SalesInvoiceService,
    private readonly salesInvoiceItemService: SalesInvoiceItemService,
    private readonly posSessionEntryService: PosSessionEntryService,
    private sequelize: Sequelize,
  ) { }

  calculateTotalAmount(items: SalesInvoiceItem[]): number {
    const amountMap = items.map((item) => item.amount);
    return amountMap.reduce((acc, currVal) => acc + currVal, 0);
  }

  async createTransaction(
    data: CreatePOSTransactionDto,
    user: UserAuthPayload,
  ) {
    const { items, ...dto } = data;

    return this.sequelize.transaction(async (t) => {
      const tx = { transaction: t };
      const invoice = await this.salesInvoiceService.create(
        {
          createDto: {
            ...dto,
          },
          user,
        },
        tx,
      );

      const currentSession = await this.posSessionEntryService.getSessionByStore(data.storeId);

      if (!currentSession) throw new BadRequestException('There is no session available');

      const invoiceItems = await this.salesInvoiceItemService.generateFromSI(
        invoice.id,
        items,
        data.posSessionId,
        tx,
      );

      invoice.totalAmount = this.calculateTotalAmount(invoiceItems);
      await invoice.save(tx);

      return invoice;
    });
  }

  async findByInvoice(invoiceId: string, user: UserAuthPayload) {
    await this.salesInvoiceService.findOne({ id: invoiceId, user });
  }

  async removeTransaction(siId: string, user: UserAuthPayload) {
    return this.sequelize.transaction(async (t) => {
      const tx = { transaction: t };

      const invoice = await this.salesInvoiceService.findOne({ id: siId }, tx);

      invoice.deletedAt = Date.now();
      invoice.updatedBy = user.sub;
      await invoice.save(tx);
    });
  }
}
