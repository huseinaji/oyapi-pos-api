import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PointOfsaleService } from '../../point-of-sale/services/point-of-sale.service';
import type { FastifyRequest } from 'fastify';
import { ApiOperation, ApiParam } from '@nestjs/swagger';
import { CreateStorePOSDto } from '../dto/create-store-pos.dto';
import { StoreResourceOwnershipGuard } from '../guards/store-resource-ownership/store-resource-ownership.guard';
import { PosSessionGuard } from '../guards/pos-session/pos-session.guard';
import { PosSessionEntry } from '../../point-of-sale/entities/pos-session-entry.entity';
import { StoreAcessRoleGuard } from '../guards/store-acess-role/store-acess-role.guard';
import { StoreAccess } from '../utils/decorators/store.decorator';
import { StoreRole } from '../utils/store.types';

@UseGuards(StoreResourceOwnershipGuard)
@Controller({ path: 'store/:id/transaction', version: '1' })
export class StorePOSController {
  constructor(private readonly posService: PointOfsaleService) { }

  @ApiOperation({ summary: 'Create a sales transaction', description: 'Creates a sales invoice in the current open POS session.' })
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

  @ApiOperation({ summary: 'Find all sellable item', description: 'Sellable item except raw material and priorityze from pos session entry item' })
  @UseGuards(PosSessionGuard)
  @Get('sellable-item')
  findAllSellableItem(@Req() req: FastifyRequest) {
    return this.posService.findAllSellableItem(req['posSession'] as PosSessionEntry);
  }

  @ApiOperation({ summary: 'Delete a sales transaction', description: 'Deletes the sales invoice identified by salesInvoiceId.' })
  @StoreAccess({
    roles: [StoreRole.ADMIN]
  })
  @UseGuards(StoreAcessRoleGuard)
  @ApiParam({
    name: 'salesInvoiceId',
    description: 'ID of the sales invoice to delete.',
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
