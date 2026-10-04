import { Module } from '@nestjs/common';
import { StoreService } from './store.service';
import { StoreController } from './controllers/store.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Store } from './entities/store.entity';
import { StoreMember } from './entities/store-member.entity';
import { PointOfSaleModule } from '../point-of-sale/point-of-sale.module';
import { StorePOSController } from './controllers/store-pos.controller';
import { StoreStockController } from './controllers/store-stock.controller';
import { InventoryModule } from '../inventory/inventory.module';
import { StoreItemController } from './controllers/store-item.controller';
import { StoreInvoiceController } from './controllers/store-invoice.controller';
import { StorePosSessionController } from './controllers/store-pos-session.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([Store, StoreMember]),
    PointOfSaleModule,
    InventoryModule,
  ],
  controllers: [
    StoreController,
    StorePOSController,
    StoreStockController,
    StoreItemController,
    StoreInvoiceController,
    StorePosSessionController,
  ],
  providers: [StoreService],
})
export class StoreModule { }
