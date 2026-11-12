import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class BaseFileStorageDto {
  @ApiProperty({
    type: String,
    description: 'Server-generated unique file metadata ID',
    example: '01J8Q2M6K4N7P9R3T5V0W1X2YZ',
    readOnly: true,
  })
  @IsString()
  id: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'Owning user ID; may be null after physical user deletion',
    example: '01J8Q2M6K4N7P9R3T5V0W1X2YZ',
    readOnly: true,
  })
  @IsOptional()
  @IsString()
  userId: string | null;

  @ApiProperty({
    type: String,
    description: 'Object key identifying the stored file',
    example: 'uploads/01J8Q2M6K4N7P9R3T5V0W1X2YZ/report.pdf',
  })
  @IsString()
  @IsNotEmpty()
  objectKey: string;

  @ApiProperty({
    type: String,
    description: 'File MIME type',
    example: 'application/pdf',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  mimeType: string;

  @ApiProperty({
    type: String,
    description: 'File status',
    example: 'uploaded',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  status: string;
}
