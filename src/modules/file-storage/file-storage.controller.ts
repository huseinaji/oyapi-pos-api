import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import { SessionFree } from '../../common/decorator/decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CreateFileStorageDto } from './dto/create-file-storage.dto';
import { QueryFileStorageDto } from './dto/query-file-storage.dto';
import { UpdateFileStorageDto } from './dto/update-file-storage.dto';
import { FileStorageService } from './file-storage.service';

@SessionFree()
@ApiTags('File storage')
@Controller({ path: 'file-storage', version: '1' })
export class FileStorageController {
  constructor(private readonly fileStorageService: FileStorageService) {}

  @Post()
  @ApiOperation({
    summary: 'Create file metadata',
    description:
      'Creates file metadata owned by the authenticated user. File bytes are not uploaded by this endpoint.',
  })
  @ApiCreatedResponse({ description: 'The created file metadata.' })
  create(
    @Body() dto: CreateFileStorageDto,
    @Req() req: FastifyRequest,
  ) {
    return this.fileStorageService.create(dto, req.user.userPayload.sub);
  }

  @Get()
  @ApiOperation({
    summary: 'List my files',
    description:
      'Lists file metadata owned by the authenticated user with optional filters and pagination.',
  })
  @ApiOkResponse({ description: 'The matching file metadata.' })
  findAll(
    @Query() query: QueryFileStorageDto,
    @Query() pagination: PaginationDto = new PaginationDto(),
    @Req() req: FastifyRequest,
  ) {
    return this.fileStorageService.findAndCountAll(
      req.user.userPayload.sub,
      query,
      pagination,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get my file metadata',
    description:
      'Returns a file record only when it belongs to the authenticated user.',
  })
  @ApiOkResponse({ description: 'The requested file metadata.' })
  findOne(@Param('id') id: string, @Req() req: FastifyRequest) {
    return this.fileStorageService.findOne(id, req.user.userPayload.sub);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update my file metadata',
    description:
      'Updates a file record only when it belongs to the authenticated user.',
  })
  @ApiOkResponse({ description: 'The updated file metadata.' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateFileStorageDto,
    @Req() req: FastifyRequest,
  ) {
    return this.fileStorageService.update(
      id,
      req.user.userPayload.sub,
      dto,
    );
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete my file metadata',
    description:
      'Deletes a file record only when it belongs to the authenticated user.',
  })
  @ApiOkResponse({ description: 'The file metadata was deleted.' })
  async remove(@Param('id') id: string, @Req() req: FastifyRequest) {
    await this.fileStorageService.remove(id, req.user.userPayload.sub);
    return { message: 'success' };
  }
}
