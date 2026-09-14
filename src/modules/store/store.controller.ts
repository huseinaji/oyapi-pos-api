import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { StoreService } from './store.service';
import { QueryStoreDto } from './dto/query-store.dto';
import { accessTokenPayload } from '../auth/utils/auth.type';
import { ApiOperation } from '@nestjs/swagger';
import { CreateStoreDto } from './dto/create-store.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Controller({ path: 'store', version: '1' })
export class StoreController {
  constructor(private readonly storeService: StoreService) { }

  @ApiOperation({ summary: 'Create Store' })
  @Post()
  create(
    @Req() req: Request,
    @Body() data: CreateStoreDto,
  ) {
    const user = req['user'] as accessTokenPayload;
    return this.storeService.create({ createDto: data, user })
  }

  @Get(':id')
  findOne(
    @Req() req: Request,
    @Param() id: string,
  ) {
    const user = req['user'] as accessTokenPayload;
    return this.storeService.findOne({ id, user });
  }

  @Get()
  findAll(
    @Query() query: QueryStoreDto,
    @Query() pagination: PaginationDto = new PaginationDto,
    @Req() req: Request,
  ) {
    const user = req['user'] as accessTokenPayload;
    return this.storeService.findAndCountAll({ queryDto: query, user }, pagination);
  }

}
