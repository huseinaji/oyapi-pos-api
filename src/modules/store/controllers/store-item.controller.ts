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

  @ApiOperation({ summary: 'Create a store item', description: 'Creates an item in the specified store from the submitted item details.' })
  @ApiParam({
    name: 'id',
    description: 'ID of the store that will own the item.',
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

  @ApiOperation({ summary: 'Create an item category', description: 'Creates a category in the specified store.' })
  @StoreAccess({
    roles: [StoreRole.ADMIN]
  })
  @UseGuards(StoreAcessRoleGuard)
  @ApiParam({
    name: 'id',
    description: 'ID of the store that will own the category.',
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

  @ApiOperation({ summary: 'List item categories', description: 'Returns the item categories for the specified store using the supplied pagination settings.' })
  @ApiParam({
    name: 'id',
    description: 'ID of the store whose categories are requested.',
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

  @ApiOperation({ summary: 'Delete an item category', description: 'Deletes the category identified by categoryId.' })
  @StoreAccess({
    roles: [StoreRole.ADMIN]
  })
  @UseGuards(StoreAcessRoleGuard)
  @ApiParam({
    name: 'id',
    description: 'ID of the store that owns the category.',
  })
  @Delete('categories/:categoryId')
  async deleteCategory(@Param('categoryId') categoryId: string) {
    await this.itemCategoryService.remove({ id: categoryId });
    return {
      message: 'success',
    };
  }

  @ApiOperation({ summary: 'List store items', description: 'Returns items matching the supplied filters and pagination settings for the specified store.' })
  @ApiParam({
    name: 'id',
    description: 'ID of the store whose items are requested.',
  })
  @Get()
  findAll(
    @Query() query: QueryItemDto,
    @Req() req: FastifyRequest,
    @Query() pagination: PaginationDto = new PaginationDto(),
  ) {
    return this.itemService.findAndCountAll(
      {
        ...query,
        storeId: req.storeSession.storeId,
      },
      pagination,
    );
  }

  @ApiOperation({ summary: 'Get a store item', description: 'Returns the item identified by itemId.' })
  @ApiParam({
    name: 'id',
    description: 'ID of the store that owns the item.',
  })
  @Get(':itemId')
  findOne(@Param('itemId') itemId: string) {
    return this.itemService.findOne(itemId);
  }

  @ApiOperation({ summary: 'Update a store item', description: 'Updates the supplied fields for the item identified by itemId.' })
  @StoreAccess({
    roles: [StoreRole.ADMIN]
  })
  @UseGuards(StoreAcessRoleGuard)
  @ApiParam({
    name: 'id',
    description: 'ID of the store that owns the item.',
  })
  @Patch(':itemId')
  update(@Param('itemId') itemId: string, @Body() data: UpdateItemDto) {
    return this.itemService.update(itemId, data);
  }

  @ApiOperation({ summary: 'Delete a store item', description: 'Deletes the item identified by itemId.' })
  @StoreAccess({
    roles: [StoreRole.ADMIN]
  })
  @UseGuards(StoreAcessRoleGuard)
  @ApiParam({
    name: 'id',
    description: 'ID of the store that owns the item.',
  })
  @Delete(':itemId')
  async remove(@Param('itemId') itemId: string) {
    await this.itemService.remove(itemId);

    return {
      message: 'success',
    };
  }

  @ApiOperation({ summary: 'Add a bundle component', description: 'Adds the submitted item as a component of the specified bundle item.' })
  @Post(':itemId/component')
  updateComponentItem(
    @Param('itemId') itemId: string,
    @Body() data: CreateItemBundleComponentDto
  ) {
    return this.itemBundleComponentService.create(data, itemId);
  }
}
