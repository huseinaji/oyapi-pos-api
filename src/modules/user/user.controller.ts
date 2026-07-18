import { Controller, Get, Body, Patch, Param, Delete, Res, Response, HttpCode, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiResponse } from '@nestjs/swagger';

@Controller({path: 'users', version: '1'})
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get()
  findAll() {
    return this.userService.findAll();
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
