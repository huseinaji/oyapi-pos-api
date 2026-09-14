import { Module } from '@nestjs/common';
import { ItemController } from './controllers/item.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Item } from './entities/item.entity';
import { Bin } from './entities/bin.entity';
import { StockLedgerEntry } from './entities/stock-ledger-entry.entity';
import { StockLedgerEntryService } from './services/stock-ledger-entry.service';
import { ItemService } from './services/item.service';
import { BinService } from './services/bin.service';
import { StockController } from './controllers/stock.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([Item, Bin, StockLedgerEntry]),
  ],
  controllers: [ItemController, StockController],
  providers: [ItemService, StockLedgerEntryService, BinService],
  exports: [ItemService, StockLedgerEntryService],
})
export class InventoryModule { }
