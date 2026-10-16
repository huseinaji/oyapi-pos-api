import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SalesInvoiceService } from '../../point-of-sale/services/sales-invoice.service';
import { ApiOperation, ApiParam } from '@nestjs/swagger';
import { QuerySalesInvoiceDto } from '../../point-of-sale/dto/query-sales-invoice.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import type { FastifyRequest } from 'fastify';
import { StoreResourceOwnershipGuard } from '../guards/store-resource-ownership/store-resource-ownership.guard';

@UseGuards(StoreResourceOwnershipGuard)
@Controller({ path: 'store/:id/invoice', version: '1' })
export class StoreInvoiceController {
  constructor(private salesInvoiceService: SalesInvoiceService) {}

  @ApiOperation({ summary: 'Get a sales invoice', description: 'Returns the sales invoice identified by salesInvoiceId.' })
  @ApiParam({
    name: 'id',
    description: 'ID of the store that owns the invoice.',
  })
  @Get(':salesInvoiceId')
  getByInvoiceId(
    @Param('salesInvoiceId') salesinvoiceId: string,
    @Req() req: FastifyRequest,
  ) {
    return this.salesInvoiceService.findOne({
      id: salesinvoiceId,
      user: req.user.userPayload,
    });
  }

  @ApiOperation({ summary: 'List sales invoices', description: 'Returns invoices matching the supplied filters and pagination settings.' })
  @ApiParam({
    name: 'id',
    description: 'ID of the store whose invoices are requested.',
  })
  @Get()
  getAllInvoices(
    @Query() query: QuerySalesInvoiceDto,
    @Query() pagination: PaginationDto,
  ) {
    return this.salesInvoiceService.findAndCountAll(
      { queryDto: query },
      pagination,
    );
  }

  @ApiOperation({ summary: 'Complete a sales invoice', description: 'Marks the sales invoice identified by salesInvoiceId as completed.' })
  @ApiParam({
    name: 'id',
    description: 'ID of the store that owns the invoice.',
  })
  @Patch(':salesInvoiceId/complete')
  setStatusComplete(
    @Param('salesInvoiceId') salesinvoiceId: string,
    @Req() req: FastifyRequest,
  ) {
    return this.salesInvoiceService.setStatusCompleted(
      salesinvoiceId,
      req.user.userPayload,
    );
  }
}
