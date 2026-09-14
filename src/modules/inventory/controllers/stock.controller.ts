import { Controller, Get, Post, Query, Req } from '@nestjs/common';
import { ItemService } from '../services/item.service';
import { StockLedgerEntryService } from '../services/stock-ledger-entry.service';
import { accessTokenPayload } from '../../auth/utils/auth.type';
import { ApiOperation } from '@nestjs/swagger';
import { QueryStockLedgerEntryDto } from '../dto/query-stockledgerentry.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';

@Controller({ path: 'stock', version: '1' })
export class StockController {
  constructor(
    private itemService: ItemService,
    private stockLedgerEntryService: StockLedgerEntryService,
  ) { }

  @ApiOperation({ description: 'Get all stock ledger entry' })
  @Get('entry')
  async stockEntry(
    @Req() req: Request,
    @Query() query: QueryStockLedgerEntryDto,
    @Query() pagination: PaginationDto = new PaginationDto(),
  ) {
    const user = req['user'] as accessTokenPayload;
    return this.stockLedgerEntryService.findAndCountAll(
      { queryDto: query, user },
      pagination,
    );
  }
}
