import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import type { FastifyRequest } from 'fastify';
import { StockLedgerEntryService } from '../../inventory/services/stock-ledger-entry.service';
import { BinService } from '../../inventory/services/bin.service';
import { QueryStockLedgerEntryDto } from '../../inventory/dto/stock-ledger-entry/query-stockledgerentry.dto';
import { QueryBinDto } from '../../inventory/dto/bin/query-bin.dto';
import { StoreContextGuard } from '../guards/store-context/store-context.guard';
import { StockAdjustmentService } from '../../inventory/services/stock-adjustment.service';
import { CreateStockAdjustmentDto } from '../../inventory/dto/stock-adjustment/create-stock-adjustment.dto';
import { BaseStockAdjustmentDto } from '../../inventory/dto/stock-adjustment/base-stock-adjustment.dto';

@UseGuards(StoreContextGuard)
@Controller({ path: 'store/:id', version: '1' })
export class StoreStockController {
  constructor(
    private stockLedgerEntryService: StockLedgerEntryService,
    private binService: BinService,
    private stockAdjusmentService: StockAdjustmentService,
  ) { }

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

  @Post('stock-adjustment')
  @ApiOperation({
    summary: 'Create a stock adjustment',
    description:
      'Creates a stock adjustment for the selected store and returns the adjustment with its items.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the store for this stock adjustment.',
  })
  @ApiCreatedResponse({
    description: 'The created stock adjustment.',
    schema: {
      example: {
        id: '01M6T8YTP0AE6WMWKT8WA3EV5E',
        type: 'issue',
        remarks: 'testing bro',
        storeId: '01M43VNG1JAKDBQ8FGXTFW7PYY',
        updatedAt: '2026-11-07T05:51:00.289Z',
        createdAt: '2026-11-07T05:51:00.289Z',
        items: [
          {
            itemId: '01M43WFQWD35MHJ80Y8N3EHJ51',
            qty: 60,
            stockAdjustmentId: '01M6T8YTP0AE6WMWKT8WA3EV5E',
          },
        ],
      },
    },
  })
  async createStockAdjustment(
    @Body() dto: CreateStockAdjustmentDto,
    @Req() req: FastifyRequest,
  ) {
    const storeId = req.storeSession.storeId;

    return this.stockAdjusmentService.create({
      ...dto,
      storeId,
    });
  }

  @ApiOperation({
    summary: 'List stock adjustments',
    description:
      'Returns stock adjustments for the selected store, including adjusted items and their item details.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the store whose stock adjustments are requested.',
  })
  @ApiOkResponse({
    description: 'The matching stock adjustments.',
    schema: {
      example: {
        count: 1,
        rows: [
          {
            id: '01M6T8YTP0AE6WMWKT8WA3EV5E',
            storeId: '01M43VNG1JAKDBQ8FGXTFW7PYY',
            type: 'issue',
            remarks: 'testing bro',
            createdAt: '2026-11-07T05:51:00.289Z',
            updatedAt: '2026-11-07T05:51:00.289Z',
            items: [
              {
                id: '01M6T8YTQJ9EPZH45T3Q6T2KMJ',
                stockAdjustmentId: '01M6T8YTP0AE6WMWKT8WA3EV5E',
                itemId: '01M43WFQWD35MHJ80Y8N3EHJ51',
                qty: 60,
                items: {
                  name: 'adonan',
                  description: '2 croffle dibagi menjadi 5 + varian 5 rasa',
                  uom: 'pcs',
                  sellingPrice: 1000,
                },
              },
            ],
          },
        ],
      },
    },
  })
  @Get('stock-adjustment')
  async getAllStockAdjustment(
    @Req() req: FastifyRequest,
  ) {
    const storeId = req.storeSession.storeId;

    return this.stockAdjusmentService.findAndCountAll({
      storeId
    })
  }
}
