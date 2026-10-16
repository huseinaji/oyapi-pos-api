import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { StoreResourceOwnershipGuard } from '../guards/store-resource-ownership/store-resource-ownership.guard';
import { ApiOperation, ApiParam } from '@nestjs/swagger';
import { PosSessionEntryService } from '../../point-of-sale/services/pos-session-entry.service';
import type { FastifyRequest } from 'fastify';
import { UserAuthPayload } from '../../auth/utils/auth.type';
import { CreateStorePosSessionEntryDto } from '../dto/create-pos-session-entry.dto';
import { QueryPosSessionEntryDto } from '../../point-of-sale/dto/query-pos-session-entry.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { PosSessionGuard } from '../guards/pos-session/pos-session.guard';

@UseGuards(StoreResourceOwnershipGuard)
@Controller({ path: 'store/:id/pos-session', version: '1' })
export class StorePosSessionController {
  constructor(private posSessionService: PosSessionEntryService) { }

  @ApiOperation({ summary: 'Open a POS session', description: 'Opens a POS session for the current store. Optional opening quantities can be supplied for items.' })
  @ApiParam({
    name: 'id',
    description: 'ID of the store for this POS session.',
  })
  @Post()
  openSession(
    @Body() data: CreateStorePosSessionEntryDto,
    @Req() req: FastifyRequest,
  ) {
    const user: UserAuthPayload = req.session.payload.userPayload;
    return this.posSessionService.create(
      req.storeSession.storeId,
      user.sub,
      data.items,
    );
  }

  @ApiOperation({ summary: 'Get the current POS session', description: 'Returns the active POS session for the current store, if one exists.' })
  @Get('current-session')
  getCurrentSession(
    @Req() req: FastifyRequest,
  ) {
    return this.posSessionService.getSessionByStore(req.storeSession.storeId);
  }

  @ApiOperation({ summary: 'List POS sessions', description: 'Returns POS sessions matching the supplied filters and pagination settings.' })
  @ApiParam({
    name: 'id',
    description: 'ID of the store whose POS sessions are requested.',
  })
  @Get()
  getAllPosSession(
    @Query() query: QueryPosSessionEntryDto,
    @Query() pagination: PaginationDto = new PaginationDto(),
  ) {
    return this.posSessionService.findAndCountAll(query, pagination);
  }

  @ApiOperation({ summary: 'Close the current POS session', description: 'Closes the active POS session for the current store.' })
  @ApiParam({
    name: 'id',
    description: 'ID of the store whose active POS session will be closed.',
  })
  @UseGuards(PosSessionGuard)
  @Delete()
  async closeSession(@Req() req: FastifyRequest) {
    const user: UserAuthPayload = req.session.payload.userPayload;

    await this.posSessionService.closePos(req.storeSession.storeId, user.sub);
    return {
      message: 'success',
    };
  }
}
