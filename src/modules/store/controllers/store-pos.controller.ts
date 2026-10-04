import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PointOfsaleService } from '../../point-of-sale/services/point-of-sale.service';
import type { FastifyRequest } from 'fastify';
import { ApiOperation, ApiParam } from '@nestjs/swagger';
import { CreateStorePOSDto } from '../dto/create-store-pos.dto';
import { StoreResourceOwnershipGuard } from '../guards/store-resource-ownership/store-resource-ownership.guard';
import { PosSessionGuard } from '../guards/pos-session/pos-session.guard';

@UseGuards(StoreResourceOwnershipGuard)
@Controller({ path: 'store/:id/transaction', version: '1' })
export class StorePOSController {
  constructor(private readonly posService: PointOfsaleService) {}

  @ApiOperation({ summary: 'Create transaction' })
  @UseGuards(PosSessionGuard)
  @Post()
  createTransaction(
    @Req() req: FastifyRequest,
    @Body() data: CreateStorePOSDto,
  ) {
    return this.posService.createTransaction(
      {
        ...data,
        posSessionId: req.posSession!.id,
        storeId: req.storeSession.storeId,
      },
      req.user.userPayload,
    );
  }

  @ApiOperation({ summary: 'Remove transaction' })
  @ApiParam({
    name: 'id',
    description: 'Store ID',
    required: true,
  })
  @Delete(':salesInvoiceId')
  deleteRecord(
    @Param('salesInvoiceId') salesinvoiceId: string,
    @Req() req: FastifyRequest,
  ) {
    return this.posService.removeTransaction(
      salesinvoiceId,
      req.user.userPayload,
    );
  }
}
