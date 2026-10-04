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

  @ApiOperation({ summary: 'Create pos session' })
  @ApiParam({
    name: 'id',
    description: 'StoreId',
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

  @ApiOperation({ summary: 'Create pos session' })
  @Get('current-session')
  getCurrentSession(
    @Req() req: FastifyRequest,
  ) {
    return this.posSessionService.getSessionByStore(req.storeSession.storeId);
  }

  @ApiOperation({ summary: 'Get all pos session' })
  @ApiParam({
    name: 'id',
    description: 'StoreId',
  })
  @Get()
  getAllPosSession(
    @Query() query: QueryPosSessionEntryDto,
    @Query() pagination: PaginationDto = new PaginationDto(),
  ) {
    return this.posSessionService.findAndCountAll(query, pagination);
  }

  @ApiOperation({ summary: 'Close pos session' })
  @ApiParam({
    name: 'id',
    description: 'StoreId',
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
