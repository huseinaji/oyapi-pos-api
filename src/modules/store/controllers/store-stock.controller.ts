import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import type { FastifyRequest } from 'fastify';
import { StockLedgerEntryService } from '../../inventory/services/stock-ledger-entry.service';
import { BinService } from '../../inventory/services/bin.service';
import { QueryStockLedgerEntryDto } from '../../inventory/dto/stock-ledger-entry/query-stockledgerentry.dto';
import { QueryBinDto } from '../../inventory/dto/bin/query-bin.dto';
import { StoreResourceOwnershipGuard } from '../guards/store-resource-ownership/store-resource-ownership.guard';

@UseGuards(StoreResourceOwnershipGuard)
@Controller({ path: 'store/:id', version: '1' })
export class StoreStockController {
  constructor(
    private stockLedgerEntryService: StockLedgerEntryService,
    private binService: BinService,
  ) {}

  @ApiOperation({ summary: 'List stock ledger entries', description: 'Returns stock movements for the current store, with optional filters and pagination.' })
  @ApiParam({
    name: 'id',
    description: 'ID of the store whose stock movements are requested.',
  })
  @Get('stock-ledger')
  async stockEntry(
    @Req() req: FastifyRequest,
    @Query() query: QueryStockLedgerEntryDto,
    @Query() pagination: PaginationDto = new PaginationDto(),
  ) {
    const storeId = req.storeSession.storeId;

    return this.stockLedgerEntryService.findAndCountAll(
      { queryDto: { ...query, storeId } },
      pagination,
    );
  }

  @ApiOperation({ summary: 'List store bins', description: 'Returns inventory bin balances for the current store, with optional filters and pagination.' })
  @ApiParam({
    name: 'id',
    description: 'ID of the store whose bins are requested.',
  })
  @Get('bins')
  async getBins(
    @Req() req: FastifyRequest,
    @Query() query: QueryBinDto,
    @Query() pagination: PaginationDto = new PaginationDto(),
  ) {
    const storeId = req.storeSession.storeId;

    return this.binService.findAndCountAll(
      {
        ...query,
        storeId,
      },
      pagination,
    );
  }
}
