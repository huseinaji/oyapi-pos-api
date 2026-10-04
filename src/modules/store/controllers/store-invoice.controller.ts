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

  @ApiOperation({ description: 'GET invoice data by id' })
  @ApiParam({
    name: 'id',
    description: 'StoreId',
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

  @ApiOperation({ description: 'GET ALL invoice data' })
  @ApiParam({
    name: 'id',
    description: 'StoreId',
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

  @ApiOperation({ summary: 'Set Status Complete' })
  @ApiParam({
    name: 'id',
    description: 'StoreId',
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
