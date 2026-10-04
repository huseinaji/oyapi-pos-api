import { Module } from '@nestjs/common';
import { ItemController } from './controllers/item.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Item } from './entities/item.entity';
import { Bin } from './entities/bin.entity';
import { StockLedgerEntry } from './entities/stock-ledger-entry.entity';
import { StockLedgerEntryService } from './services/stock-ledger-entry.service';
import { ItemService } from './services/item.service';
import { BinService } from './services/bin.service';
import { ItemCategory } from './entities/item-category.entity';
import { ItemCategoryService } from './services/item-category.service';
import { ItemBundleComponent } from './entities/item-bundle-component.entity';
import { ItemBundleComponentService } from './services/item-bundle-component.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Item,
      Bin,
      StockLedgerEntry,
      ItemCategory,
      ItemBundleComponent,
    ]),
  ],
  controllers: [ItemController],
  providers: [
    ItemService,
    StockLedgerEntryService,
    BinService,
    ItemCategoryService,
    ItemBundleComponentService,
  ],
  exports: [
    ItemService,
    StockLedgerEntryService,
    BinService,
    ItemCategoryService,
    ItemBundleComponentService,
  ],
})
export class InventoryModule {}
