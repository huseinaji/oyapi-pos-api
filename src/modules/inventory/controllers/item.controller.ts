import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ItemService } from '../services/item.service';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { CreateItemDto } from '../dto/items/create-item.dto';
import { QueryItemDto } from '../dto/items/query-item.dto';
import { UpdateItemDto } from '../dto/items/update-item.dto';
import type { FastifyRequest } from 'fastify'
import { Roles, SessionFree } from '../../../common/decorator/decorator';
import { UserRole } from '../../user/utils/user.types';

@SessionFree()
@Roles(UserRole.ADMIN)
@Controller({ path: 'items', version: '1' })
export class ItemController {
  constructor(private readonly itemService: ItemService) { }

  @ApiOperation({ description: 'Create Item' })
  @Post()
  create(@Body() data: CreateItemDto, @Req() req: FastifyRequest) {
    const user = req.user;

    return this.itemService.create({
      ...data,
    }, user.userPayload);
  }

  @ApiOperation({ description: 'Get All Item' })
  @Get()
  findAll(
    @Query() query: QueryItemDto,
    @Query() pagination: PaginationDto = new PaginationDto()
  ) {
    return this.itemService.findAndCountAll({
      ...query,
    }, pagination);
  }

  @ApiOperation({ description: 'Get One Item by Id' })
  @Get(':id')
  findOne(
    @Param('id') id: string,
  ) {
    return this.itemService.findOne(id);
  }

  @ApiOperation({ description: 'Update Item' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() data: UpdateItemDto) {
    return this.itemService.update(id, data);
  }

  @ApiOperation({ description: 'Delete Item by Id' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.itemService.remove(id);

    return {
      message: 'success'
    }
  }
}
