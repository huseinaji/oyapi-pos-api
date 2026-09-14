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
import { CreateItemDto } from '../dto/create-item.dto';
import { UpdateItemDto } from '../dto/update-item.dto';
import { QueryItemDto } from '../dto/query-item.dto';
import { accessTokenPayload } from '../../auth/utils/auth.type';
import { ApiOperation } from '@nestjs/swagger';
import { ItemService } from '../services/item.service';

@Controller({ path: 'items', version: '1' })
export class ItemController {
  constructor(private readonly itemService: ItemService) { }

  @ApiOperation({ description: 'Create Item' })
  @Post()
  create(@Body() data: CreateItemDto, @Req() req: Request) {
    const user = req['user'] as accessTokenPayload;
    return this.itemService.create({ createDto: data, user });
  }

  @ApiOperation({ description: 'Get All Item' })
  @Get()
  findAll(@Query() query: QueryItemDto) {
    return this.itemService.findAndCountAll({ queryDto: query });
  }

  @ApiOperation({ description: 'Get One Item by Id' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.itemService.findOne({ id });
  }

  @ApiOperation({ description: 'Update Item' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() data: UpdateItemDto) {
    return this.itemService.update({ id, updateDto: data });
  }

  @ApiOperation({ description: 'Delete Item by Id' })
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    const user = req['user'] as accessTokenPayload;
    await this.itemService.remove({ id, user });

    return {
      message: 'success'
    }
  }
}
