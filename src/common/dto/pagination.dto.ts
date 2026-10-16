import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto {
  @ApiProperty({ type: Number, example: 1, description: '1-based page number. Defaults to 1.', required: false, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiProperty({ type: Number, example: 20, description: 'Maximum number of records per page. Defaults to 20; maximum is 100.', required: false, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  getPagination() {
    return { 
      page: this.page, 
      limit: this.limit,
      offset: (this.page - 1) * this.limit,
    };
  }
}