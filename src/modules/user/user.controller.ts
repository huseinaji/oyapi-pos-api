import { Controller, Get, Body, Patch, Param, Delete, Query, Headers } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Roles, SessionFree } from '../../common/decorator/decorator';
import { UserRole } from './utils/user.types';
import { ApiOperation } from '@nestjs/swagger';

@SessionFree()
@Roles(UserRole.ADMIN)
@Controller({ path: 'users', version: '1' })
export class UserController {
  constructor(private readonly userService: UserService) { }
  @ApiOperation({ summary: 'List users', description: 'Returns users matching the supplied filters and pagination settings.' })
  @Get()
  findAll(
    @Query() query: QueryUserDto,
    @Query() pagination: PaginationDto = new PaginationDto,
  ) {
    return this.userService.findAll(query, pagination);
  }

  @ApiOperation({ summary: 'Get a user', description: 'Returns the user identified by the path parameter.' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a user', description: 'Updates the supplied fields for the user identified by the path parameter.' })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const result = await this.userService.update(id, updateUserDto);
    return result;
  }

  @ApiOperation({ summary: 'Delete a user', description: 'Deletes the user identified by the path parameter.' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
