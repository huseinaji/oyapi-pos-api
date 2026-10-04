import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SalesInvoice } from './entities/sales-invoice.entity';
import { SalesInvoiceService } from './services/sales-invoice.service';
import { SalesInvoiceItem } from './entities/sales-invoice-item.entity';
import { PointOfsaleService } from './services/point-of-sale.service';
import { SalesInvoiceItemService } from './services/sales-invoice-item.service';
import { InventoryModule } from '../inventory/inventory.module';
import { PosSessionEntryService } from './services/pos-session-entry.service';
import { PosSessionEntry } from './entities/pos-session-entry.entity';
import { PosSessionEntryItem } from './entities/pos-session-entry-item.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([
      SalesInvoice,
      SalesInvoiceItem,
      PosSessionEntry,
      PosSessionEntryItem,
    ]),
    InventoryModule,
  ],
  providers: [
    SalesInvoiceService,
    PointOfsaleService,
    SalesInvoiceItemService,
    PosSessionEntryService,
  ],
  exports: [SalesInvoiceService, PointOfsaleService, PosSessionEntryService],
})
export class PointOfSaleModule {}
