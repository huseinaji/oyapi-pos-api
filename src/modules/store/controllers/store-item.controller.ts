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
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import { ItemService } from '../../inventory/services/item.service';
import { QueryItemDto } from '../../inventory/dto/items/query-item.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { UpdateItemDto } from '../../inventory/dto/items/update-item.dto';
import { ItemCategoryService } from '../../inventory/services/item-category.service';
import { CreateStoreItemDto } from '../dto/createStoreItem.dto';
import { CreateStoreItemCategoryDto } from '../dto/create-store-itemcategory.dto';
import { StoreResourceOwnershipGuard } from '../guards/store-resource-ownership/store-resource-ownership.guard';
import { ItemBundleComponentService } from '../../inventory/services/item-bundle-component.service';
import { CreateItemBundleComponentDto } from '../../inventory/dto/item-bundle-component/create-item-bundle-component.dto';
import { StoreAccess } from '../utils/decorators/store.decorator';
import { StoreRole } from '../utils/store.types';
import { StoreAcessRoleGuard } from '../guards/store-acess-role/store-acess-role.guard';

@UseGuards(StoreResourceOwnershipGuard)
@Controller({ path: 'store/:id/items', version: '1' })
export class StoreItemController {
  constructor(
    private readonly itemService: ItemService,
    private readonly itemCategoryService: ItemCategoryService,
    private readonly itemBundleComponentService: ItemBundleComponentService,
  ) { }

  @ApiOperation({ description: 'Create Item' })
  @ApiParam({
    name: 'id',
    description: 'StoreId',
  })
  @StoreAccess({ roles: [StoreRole.ADMIN] })
  @UseGuards(StoreAcessRoleGuard)
  @Post()
  create(@Body() data: CreateStoreItemDto, @Req() req: FastifyRequest) {
    const user = req.user;

    return this.itemService.create(
      {
        ...data,
        storeId: req.storeSession.storeId,
      },
      user.userPayload,
    );
  }

  @ApiOperation({ description: 'Create Item Category' })
  @ApiParam({
    name: 'id',
    description: 'StoreId',
  })
  @Post('categories')
  createCategory(
    @Body() data: CreateStoreItemCategoryDto,
    @Req() req: FastifyRequest,
  ) {
    return this.itemCategoryService.create({
      createDto: {
        ...data,
        storeId: req.storeSession.storeId,
      },
    });
  }

  @ApiOperation({ description: 'Get Item Category' })
  @ApiParam({
    name: 'id',
    description: 'StoreId',
  })
  @Get('categories')
  getItemCategory(
    @Req() req: FastifyRequest,
    @Query() pagination: PaginationDto = new PaginationDto(),
  ) {
    return this.itemCategoryService.findAndCountAll(
      { queryDto: { storeId: req.storeSession.storeId } },
      pagination,
    );
  }

  @ApiOperation({ description: 'Get Item Category' })
  @ApiParam({
    name: 'id',
    description: 'StoreId',
  })
  @Delete('categories/:categoryId')
  async deleteCategory(@Param('categoryId') categoryId: string) {
    await this.itemCategoryService.remove({ id: categoryId });
    return {
      message: 'success',
    };
  }

  @ApiOperation({ description: 'Get All Item' })
  @ApiParam({
    name: 'id',
    description: 'StoreId',
  })
  @Get()
  findAll(
    @Query() query: QueryItemDto,
    @Req() req: FastifyRequest,
    @Query() pagination: PaginationDto = new PaginationDto(),
  ) {
    console.log(query, pagination, req.storeSession.storeId)
    return this.itemService.findAndCountAll(
      {
        ...query,
        storeId: req.storeSession.storeId,
      },
      pagination,
    );
  }

  @ApiOperation({ description: 'Get One Item by Id' })
  @ApiParam({
    name: 'id',
    description: 'StoreId',
  })
  @Get(':itemId')
  findOne(@Param('itemId') itemId: string) {
    return this.itemService.findOne(itemId);
  }

  @ApiOperation({ description: 'Update Item' })
  @ApiParam({
    name: 'id',
    description: 'StoreId',
  })
  @Patch(':itemId')
  update(@Param('itemId') itemId: string, @Body() data: UpdateItemDto) {
    return this.itemService.update(itemId, data);
  }

  @ApiOperation({ description: 'Delete Item by itemId' })
  @ApiParam({
    name: 'id',
    description: 'StoreId',
  })
  @Delete(':itemId')
  async remove(@Param('itemId') itemId: string) {
    await this.itemService.remove(itemId);

    return {
      message: 'success',
    };
  }

  @ApiOperation({ summary: 'Add component item' })
  @Post(':itemId/component')
  updateComponentItem(
    @Param('itemId') itemId: string,
    @Body() data: CreateItemBundleComponentDto
  ) {
    return this.itemBundleComponentService.create(data, itemId);
  }
}
