import { Module } from '@nestjs/common';
import { PointOfSaleController } from './controllers/point-of-sale.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { SalesInvoice } from './entities/sales-invoice.entity';
import { SalesInvoiceService } from './services/sales-invoice.service';
import { SalesInvoiceItem } from './entities/sales-invoice-item.entity';
import { PointOfsaleService } from './services/point-of-sale.service';
import { SalesInvoiceItemService } from './services/sales-invoice-item.service';
import { SalesInvoiceController } from './controllers/sales-invoice.controller';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [
    SequelizeModule.forFeature([SalesInvoice, SalesInvoiceItem]),
    InventoryModule,
  ],
  controllers: [PointOfSaleController, SalesInvoiceController],
  providers: [
    SalesInvoiceService,
    PointOfsaleService,
    SalesInvoiceItemService,
  ],
})
export class PointOfSaleModule { }
