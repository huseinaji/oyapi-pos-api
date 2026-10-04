import { Controller, Get, Body, Patch, Param, Delete, Query, Headers } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Roles, SessionFree } from '../../common/decorator/decorator';
import { UserRole } from './utils/user.types';

@SessionFree()
@Roles(UserRole.ADMIN)
@Controller({ path: 'users', version: '1' })
export class UserController {
  constructor(private readonly userService: UserService) { }
  @Get()
  findAll(
    @Query() query: QueryUserDto,
    @Query() pagination: PaginationDto = new PaginationDto,
  ) {
    return this.userService.findAll(query, pagination);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const result = await this.userService.update(id, updateUserDto);
    return result;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
