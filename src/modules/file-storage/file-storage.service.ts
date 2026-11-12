import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { S3ProviderService } from '../../infrastructure/s3-provider/s3-provider.service';
import { CreateFileStorageDto } from './dto/create-file-storage.dto';
import { QueryFileStorageDto } from './dto/query-file-storage.dto';
import { UpdateFileStorageDto } from './dto/update-file-storage.dto';
import { FileStorage } from './entities/file-storage.entity';

@Injectable()
export class FileStorageService {
  constructor(
    @InjectModel(FileStorage)
    private readonly model: typeof FileStorage,
    private readonly s3Provider: S3ProviderService,
  ) {}

  create(createDto: CreateFileStorageDto, userId: string): Promise<FileStorage> {
    return this.model.create({ ...createDto, userId });
  }

  findAndCountAll(
    userId: string,
    queryDto: QueryFileStorageDto,
    pagination?: PaginationDto,
  ) {
    return this.model.findAndCountAll({
      where: { userId, ...queryDto },
      order: [['createdAt', 'DESC']],
      ...(pagination?.getPagination() ?? {}),
    });
  }

  async findOne(id: string, userId: string): Promise<FileStorage> {
    const fileStorage = await this.model.findOne({
      where: { id, userId },
    });

    if (!fileStorage) {
      throw new NotFoundException('File storage not found');
    }

    return fileStorage;
  }

  async update(
    id: string,
    userId: string,
    updateDto: UpdateFileStorageDto,
  ): Promise<FileStorage> {
    const hasValue = Object.values(updateDto).some(
      (value) => value !== undefined,
    );

    if (!hasValue) {
      throw new BadRequestException('Request body cannot be empty');
    }

    const fileStorage = await this.findOne(id, userId);
    await fileStorage.update(updateDto);
    return fileStorage;
  }

  async remove(id: string, userId: string): Promise<boolean> {
    const fileStorage = await this.findOne(id, userId);
    await this.s3Provider.deleteFile(fileStorage.objectKey);
    await fileStorage.destroy();
    return true;
  }

  /**
   * Get presigned download URL for a file
   */
  async getPresignedDownloadUrl(
    id: string,
    userId: string,
    expiresIn?: number,
  ): Promise<string> {
    const fileStorage = await this.findOne(id, userId);
    return this.s3Provider.getPresignedDownloadUrl(
      fileStorage.objectKey,
      expiresIn,
    );
  }

  /**
   * Get presigned upload URL for a file
   */
  async getPresignedUploadUrl(
    id: string,
    userId: string,
    contentType?: string,
    expiresIn?: number,
  ): Promise<string> {
    const fileStorage = await this.findOne(id, userId);
    return this.s3Provider.getPresignedUploadUrl(
      fileStorage.objectKey,
      contentType,
      expiresIn,
    );
  }

  /**
   * Upload file content to S3
   */
  async uploadFileContent(
    fileId: string,
    userId: string,
    content: Buffer,
    contentType?: string,
  ): Promise<void> {
    const fileStorage = await this.findOne(fileId, userId);
    await this.s3Provider.uploadFile(
      fileStorage.objectKey,
      content,
      contentType,
    );
  }

  /**
   * Download file content from S3
   */
  async downloadFileContent(
    fileId: string,
    userId: string,
  ): Promise<Buffer> {
    const fileStorage = await this.findOne(fileId, userId);
    return this.s3Provider.downloadFile(fileStorage.objectKey);
  }
}
