import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsDefined,
  IsEnum,
  IsOptional,
  IsTimeZone,
  Matches,
  Validate,
  ValidateIf,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

export enum DateRangeQueryType {
  TODAY = 'today',
  LAST_30_DAYS = 'last30days',
  CUSTOM = 'custom',
}

@ValidatorConstraint({ name: 'endDateOnOrAfterStartDate', async: false })
class EndDateOnOrAfterStartDateConstraint implements ValidatorConstraintInterface {
  validate(endDate: unknown, args: ValidationArguments): boolean {
    const startDate = (args.object as BaseDateRangeQueryDto).startDate;
    if (typeof startDate !== 'string' || typeof endDate !== 'string') {
      return true;
    }
    return startDate <= endDate;
  }

  defaultMessage(): string {
    return 'endDate must be on or after startDate';
  }
}

export class BaseDateRangeQueryDto {
  @ApiPropertyOptional({
    enum: DateRangeQueryType,
    description:
      'Filter to today by default, the rolling last 30 days, or an inclusive custom calendar date range.',
    example: DateRangeQueryType.TODAY,
  })
  @IsOptional()
  @IsEnum(DateRangeQueryType)
  dateRange?: DateRangeQueryType;

  @ApiPropertyOptional({
    description:
      'IANA timezone, required when dateRange is supplied. Defaults to UTC when omitted.',
    example: 'Asia/Jakarta',
  })
  @ValidateIf((query: BaseDateRangeQueryDto) => query.dateRange !== undefined)
  @IsDefined()
  @IsTimeZone()
  timezone?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date',
    description:
      'Inclusive start date (YYYY-MM-DD), required for custom range.',
    example: '2026-10-01',
  })
  @ValidateIf(
    (query: BaseDateRangeQueryDto) =>
      query.dateRange === DateRangeQueryType.CUSTOM,
  )
  @IsDefined()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsDateString({ strict: true })
  startDate?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date',
    description: 'Inclusive end date (YYYY-MM-DD), required for custom range.',
    example: '2026-10-26',
  })
  @ValidateIf(
    (query: BaseDateRangeQueryDto) =>
      query.dateRange === DateRangeQueryType.CUSTOM,
  )
  @IsDefined()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsDateString({ strict: true })
  @Validate(EndDateOnOrAfterStartDateConstraint)
  endDate?: string;
}
