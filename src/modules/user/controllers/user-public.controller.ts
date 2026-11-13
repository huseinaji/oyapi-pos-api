import { Controller, Get, Query } from '@nestjs/common';
import { UserService } from '../user.service';
import { ApiOperation } from '@nestjs/swagger';
import { QueryListUserDto } from '../dto/query-user.dto';
import { SessionFree } from '../../../common/decorator/decorator';

@Controller({version: '1' })
export class UserPublicController {
  constructor(private readonly userService: UserService) { }

  @ApiOperation({
    summary: 'Query user by username limit by 5'
  })
  @SessionFree()
  @Get('user-list')
  queryUserbyUsername(
    @Query() query: QueryListUserDto
  ) {
    return this.userService.getUsernameList(query.username);
  }
}
