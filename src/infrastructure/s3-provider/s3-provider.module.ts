import { Module } from '@nestjs/common';
import { S3ProviderService } from './s3-provider.service';

@Module({
  providers: [S3ProviderService],
  exports: [S3ProviderService],
})
export class S3ProviderModule {}
