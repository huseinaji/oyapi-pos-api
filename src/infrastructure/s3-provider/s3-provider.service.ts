import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
  CopyObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GET_ENV_VARIABLE } from '../../common/utils';

@Injectable()
export class S3ProviderService {
  private readonly logger = new Logger(S3ProviderService.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly region: string;

  constructor() {
    this.region = GET_ENV_VARIABLE('AWS_REGION', 'us-east-1');
    this.bucket = GET_ENV_VARIABLE('AWS_S3_BUCKET');

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: GET_ENV_VARIABLE('AWS_ACCESS_KEY_ID'),
        secretAccessKey: GET_ENV_VARIABLE('AWS_SECRET_ACCESS_KEY'),
      },
    });

    this.logger.debug(
      `S3 provider initialized with bucket: ${this.bucket}, region: ${this.region}`,
    );
  }

  /**
   * Upload a file to S3
   */
  async uploadFile(
    key: string,
    body: Buffer | Uint8Array | string,
    contentType: string = 'application/octet-stream',
    metadata?: Record<string, string>,
  ): Promise<void> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        Metadata: metadata,
      });

      await this.s3Client.send(command);
      this.logger.debug(`File uploaded successfully: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to upload file ${key}:`, error);
      throw error;
    }
  }

  /**
   * Download a file from S3
   */
  async downloadFile(key: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await this.s3Client.send(command);
      const chunks: Uint8Array[] = [];

      if (response.Body) {
        for await (const chunk of response.Body as any) {
          chunks.push(chunk);
        }
      }

      return Buffer.concat(chunks);
    } catch (error) {
      this.logger.error(`Failed to download file ${key}:`, error);
      throw error;
    }
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.debug(`File deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file ${key}:`, error);
      throw error;
    }
  }

  /**
   * Generate a presigned URL for downloading a file
   */
  async getPresignedDownloadUrl(
    key: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const url = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });

      this.logger.debug(`Presigned download URL generated for: ${key}`);
      return url;
    } catch (error) {
      this.logger.error(`Failed to generate presigned URL for ${key}:`, error);
      throw error;
    }
  }

  /**
   * Generate a presigned URL for uploading a file
   */
  async getPresignedUploadUrl(
    key: string,
    contentType: string = 'application/octet-stream',
    expiresIn: number = 3600,
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: contentType,
      });

      const url = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });

      this.logger.debug(`Presigned upload URL generated for: ${key}`);
      return url;
    } catch (error) {
      this.logger.error(`Failed to generate presigned upload URL for ${key}:`, error);
      throw error;
    }
  }

  /**
   * Check if a file exists in S3
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error: any) {
      if (error.name === 'NotFound') {
        return false;
      }
      this.logger.error(`Failed to check if file exists ${key}:`, error);
      throw error;
    }
  }

  /**
   * List objects in a bucket with optional prefix
   */
  async listObjects(prefix?: string, maxKeys?: number) {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: prefix,
        MaxKeys: maxKeys,
      });

      const response = await this.s3Client.send(command);
      this.logger.debug(`Listed objects with prefix: ${prefix}`);
      return response.Contents || [];
    } catch (error) {
      this.logger.error(`Failed to list objects with prefix ${prefix}:`, error);
      throw error;
    }
  }

  /**
   * Copy an object within the same bucket
   */
  async copyObject(sourceKey: string, destinationKey: string): Promise<void> {
    try {
      const command = new CopyObjectCommand({
        Bucket: this.bucket,
        CopySource: `${this.bucket}/${sourceKey}`,
        Key: destinationKey,
      });

      await this.s3Client.send(command);
      this.logger.debug(
        `Object copied from ${sourceKey} to ${destinationKey}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to copy object from ${sourceKey} to ${destinationKey}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Get the S3 client instance
   */
  getClient(): S3Client {
    return this.s3Client;
  }

  /**
   * Get the bucket name
   */
  getBucketName(): string {
    return this.bucket;
  }

  /**
   * Get the region
   */
  getRegion(): string {
    return this.region;
  }
}
