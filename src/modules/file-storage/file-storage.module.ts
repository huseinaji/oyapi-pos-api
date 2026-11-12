import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../user/entities/user.entity';
import { S3ProviderModule } from '../../infrastructure/s3-provider/s3-provider.module';
import { FileStorage } from './entities/file-storage.entity';
import { FileStorageService } from './file-storage.service';
import { FileStorageController } from './file-storage.controller';

@Module({
  imports: [SequelizeModule.forFeature([FileStorage]), S3ProviderModule],
  controllers: [FileStorageController],
  providers: [FileStorageService],
})
export class FileStorageModule {}
