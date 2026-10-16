import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  Session,
  UseGuards,
} from '@nestjs/common';
import { StoreService } from '../store.service';
import { QueryStoreDto } from '../dto/query-store.dto';
import { BaseSessionPayload, UserAuthPayload } from '../../auth/utils/auth.type';
import { ApiOperation } from '@nestjs/swagger';
import { CreateStoreDto } from '../dto/create-store.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { Roles, SessionFree } from '../../../common/decorator/decorator';
import { UserRole } from '../../user/utils/user.types';
import { AssignMmeberStoreDto } from '../dto/assign-member.dto';
import { StoreAccess } from '../utils/decorators/store.decorator';
import { StoreRole } from '../utils/store.types';
import { StoreAcessRoleGuard } from '../guards/store-acess-role/store-acess-role.guard';
import { UpdateStoreDto } from '../dto/update-store.dto';
import type { FastifySessionObject } from '@fastify/session';
import type { FastifyRequest } from 'fastify';

@SessionFree()
@Controller({ path: 'store', version: '1' })
export class StoreController {
  constructor(private readonly storeService: StoreService) { }

  @ApiOperation({ summary: 'Create a store', description: 'Creates a store using the submitted store details.' })
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Req() req: Request, @Body() data: CreateStoreDto) {
    const user = req['user'] as BaseSessionPayload;
    return this.storeService.create({ createDto: data, user: user.userPayload });
  }

  @ApiOperation({ summary: 'Select a store', description: 'Selects a store for the current session and sets it as the active store.' })
  @Post(':id/select')
  async selectStore(
    @Param('id') id: string,
    @Session() session: FastifySessionObject,
    @Req() req: FastifyRequest,
  ) {
    const user = req['user'] as BaseSessionPayload;

    const payload = await this.storeService.selectStore(id, user.userPayload);

    session.payload.userPayload.store = { storeId: id, role: payload.role };

    return {
      success: true,
      data: payload,
    };
  }

  @ApiOperation({ summary: 'Assign a store member', description: 'Adds the submitted user to the store. Requires the store administrator role.' })
  @StoreAccess({
    roles: [StoreRole.ADMIN],
  })
  @UseGuards(StoreAcessRoleGuard)
  @Post(':id/assign')
  assignMember(@Param('id') id: string, @Body() data: AssignMmeberStoreDto) {
    return this.storeService.assignMember(id, data.userId);
  }

  @ApiOperation({ summary: 'List store members', description: 'Returns the members assigned to the specified store.' })
  @StoreAccess({
    roles: [StoreRole.ADMIN, StoreRole.CASHIER],
  })
  @UseGuards(StoreAcessRoleGuard)
  @Get(':id/members')
  getStoreMembers(
    @Param('id') id: string,
  ) {
    return this.storeService.getMembers(id);
  }

  @ApiOperation({ summary: 'Get a store', description: 'Returns the specified store when the current user has access to it.' })
  @StoreAccess({
    roles: [StoreRole.ADMIN, StoreRole.CASHIER],
  })
  @UseGuards(StoreAcessRoleGuard)
  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    const user = req['user'] as UserAuthPayload;
    return this.storeService.findOne({ id, user });
  }

  @ApiOperation({ summary: 'List stores', description: 'Returns stores matching the supplied filters and pagination settings.' })
  @Roles(UserRole.ADMIN)
  @Get()
  findAll(
    @Query() query: QueryStoreDto,
    @Query() pagination: PaginationDto = new PaginationDto(),
    @Req() req: Request,
  ) {
    const user = req['user'] as UserAuthPayload;
    return this.storeService.findAndCountAll(
      { queryDto: query, user },
      pagination,
    );
  }

  @ApiOperation({ summary: 'List my stores', description: 'Returns stores available to the authenticated user.' })
  @Get('my-store')
  getMyStore(
    @Req() req: FastifyRequest,
    @Query() pagination: PaginationDto = new PaginationDto(),
  ) {
    return this.storeService.getMyStore(req.user.userPayload, pagination);
  }

  @ApiOperation({ summary: 'Update a store', description: 'Updates the specified store with the submitted fields.' })
  @StoreAccess({ roles: [StoreRole.ADMIN] })
  @UseGuards(StoreAcessRoleGuard)
  async update(@Param('id') id: string, @Body() body: UpdateStoreDto) {
    return this.storeService.update({ id, updateDto: body });
  }

  @ApiOperation({ summary: 'Delete a store', description: 'Deletes the store identified by the path parameter.' })
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.storeService.remove({ id });

    return {
      message: 'success',
    };
  }
}
