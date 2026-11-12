# S3 Provider

A NestJS service for managing AWS S3 operations, integrated with the file-storage module.

## Overview

The `S3ProviderService` is a singleton service that provides a clean, injectable API for S3 operations. It handles:

- File uploads and downloads
- Presigned URLs (for both upload and download)
- File existence checks
- File deletion
- Object listing
- Object copying

## Installation

The required AWS SDK packages are already installed:

```bash
bun add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

## Configuration

Add the following environment variables to your `.env` file:

```env
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

## Usage

### Import the Module

The `S3ProviderModule` is already integrated into the main `AppModule` and the `FileStorageModule`.

### Inject the Service

```typescript
import { S3ProviderService } from '../../infrastructure/s3-provider/s3-provider.service';

@Injectable()
export class MyService {
  constructor(private readonly s3Provider: S3ProviderService) {}

  async uploadFile(key: string, buffer: Buffer): Promise<void> {
    await this.s3Provider.uploadFile(key, buffer, 'application/octet-stream');
  }
}
```

## API Reference

### uploadFile

Uploads a file to S3.

```typescript
async uploadFile(
  key: string,
  body: Buffer | Uint8Array | string,
  contentType?: string,
  metadata?: Record<string, string>,
): Promise<void>
```

**Parameters:**
- `key`: The S3 object key (path)
- `body`: File content
- `contentType`: MIME type (default: `application/octet-stream`)
- `metadata`: Optional S3 object metadata

**Example:**
```typescript
await this.s3Provider.uploadFile(
  'uploads/profile.jpg',
  fileBuffer,
  'image/jpeg',
  { userId: 'user123' }
);
```

### downloadFile

Downloads a file from S3.

```typescript
async downloadFile(key: string): Promise<Buffer>
```

**Parameters:**
- `key`: The S3 object key

**Returns:** File content as a Buffer

**Example:**
```typescript
const buffer = await this.s3Provider.downloadFile('uploads/profile.jpg');
```

### deleteFile

Deletes a file from S3.

```typescript
async deleteFile(key: string): Promise<void>
```

**Parameters:**
- `key`: The S3 object key

**Example:**
```typescript
await this.s3Provider.deleteFile('uploads/old-file.jpg');
```

### getPresignedDownloadUrl

Generates a presigned URL for downloading a file (without AWS credentials).

```typescript
async getPresignedDownloadUrl(
  key: string,
  expiresIn?: number,
): Promise<string>
```

**Parameters:**
- `key`: The S3 object key
- `expiresIn`: URL expiration time in seconds (default: 3600)

**Returns:** A presigned URL string

**Example:**
```typescript
const url = await this.s3Provider.getPresignedDownloadUrl(
  'uploads/profile.jpg',
  7200 // 2 hours
);
```

### getPresignedUploadUrl

Generates a presigned URL for uploading a file (without AWS credentials).

```typescript
async getPresignedUploadUrl(
  key: string,
  contentType?: string,
  expiresIn?: number,
): Promise<string>
```

**Parameters:**
- `key`: The S3 object key
- `contentType`: MIME type (default: `application/octet-stream`)
- `expiresIn`: URL expiration time in seconds (default: 3600)

**Returns:** A presigned URL string

**Example:**
```typescript
const url = await this.s3Provider.getPresignedUploadUrl(
  'uploads/profile.jpg',
  'image/jpeg',
  3600
);
```

### fileExists

Checks if a file exists in S3.

```typescript
async fileExists(key: string): Promise<boolean>
```

**Parameters:**
- `key`: The S3 object key

**Returns:** `true` if the file exists, `false` otherwise

**Example:**
```typescript
if (await this.s3Provider.fileExists('uploads/profile.jpg')) {
  console.log('File exists');
}
```

### listObjects

Lists objects in the S3 bucket with optional prefix filtering.

```typescript
async listObjects(prefix?: string, maxKeys?: number): Promise<_Object[]>
```

**Parameters:**
- `prefix`: Optional key prefix to filter objects
- `maxKeys`: Maximum number of objects to return

**Returns:** Array of S3 objects

**Example:**
```typescript
const objects = await this.s3Provider.listObjects('uploads/', 100);
```

### copyObject

Copies an object within the same bucket.

```typescript
async copyObject(sourceKey: string, destinationKey: string): Promise<void>
```

**Parameters:**
- `sourceKey`: Source object key
- `destinationKey`: Destination object key

**Example:**
```typescript
await this.s3Provider.copyObject('uploads/profile.jpg', 'backup/profile.jpg');
```

### Getter Methods

```typescript
getClient(): S3Client           // Returns the raw S3Client instance
getBucketName(): string         // Returns the configured bucket name
getRegion(): string             // Returns the configured AWS region
```

## FileStorageService Integration

The `FileStorageService` now includes S3 operations:

### uploadFileContent

```typescript
async uploadFileContent(
  fileId: string,
  userId: string,
  content: Buffer,
  contentType?: string,
): Promise<void>
```

### downloadFileContent

```typescript
async downloadFileContent(
  fileId: string,
  userId: string,
): Promise<Buffer>
```

### getPresignedDownloadUrl

```typescript
async getPresignedDownloadUrl(
  fileId: string,
  userId: string,
  expiresIn?: number,
): Promise<string>
```

### getPresignedUploadUrl

```typescript
async getPresignedUploadUrl(
  fileId: string,
  userId: string,
  contentType?: string,
  expiresIn?: number,
): Promise<string>
```

## Error Handling

All S3 operations include comprehensive logging. Errors are logged with context and re-thrown for handling at the controller/caller level.

```typescript
try {
  await this.s3Provider.uploadFile(key, buffer);
} catch (error) {
  // Handle error - it's already logged
}
```

## Testing

When testing services that use `S3ProviderService`, create a mock:

```typescript
const mockS3Provider = {
  uploadFile: jest.fn(),
  downloadFile: jest.fn(),
  deleteFile: jest.fn(),
  getPresignedDownloadUrl: jest.fn(),
  getPresignedUploadUrl: jest.fn(),
  fileExists: jest.fn(),
  listObjects: jest.fn(),
  copyObject: jest.fn(),
  getClient: jest.fn(),
  getBucketName: jest.fn(),
  getRegion: jest.fn(),
};

const module = await Test.createTestingModule({
  providers: [
    MyService,
    {
      provide: S3ProviderService,
      useValue: mockS3Provider,
    },
  ],
}).compile();
```

## Architecture Notes

- **Singleton Pattern**: `S3ProviderService` is a singleton, shared across the application
- **Dependency Injection**: Injected via NestJS DI container
- **Error Handling**: All errors are logged with context before being re-thrown
- **Configuration**: Uses `GET_ENV_VARIABLE` utility for environment variable access
- **Type Safety**: Full TypeScript support with proper typing

## Best Practices

1. **Use descriptive keys**: Organize S3 keys with meaningful prefixes (e.g., `uploads/users/{userId}/profile.jpg`)
2. **Set appropriate TTLs**: Use short expiration times for presigned URLs in production
3. **Handle errors gracefully**: Wrap S3 operations in try-catch blocks
4. **Monitor logs**: Check application logs for S3 operation failures
5. **Test with mocks**: Mock the service in unit tests to avoid S3 calls
