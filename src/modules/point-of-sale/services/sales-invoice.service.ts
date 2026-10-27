import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  BaseService,
  CreateOptions,
  FindAllOptions,
  TxOptions,
} from '../../../common/base/base.service';
import { InjectModel } from '@nestjs/sequelize';
import { SalesInvoice } from '../entities/sales-invoice.entity';
import { FindOptions, Op, WhereOptions } from 'sequelize';
import { GET_SALESINVOICEITEM_INCLUDE } from '../utils/sales-invoice-item.include';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { QuerySalesInvoiceDto } from '../dto/query-sales-invoice.dto';
import { GET_USER_INCLUDE } from '../../user/utils/user.include';
import { UserAuthPayload } from '../../auth/utils/auth.type';
import { SalesInvoiceStatus } from '../utils/pos.type';
import { UserRole } from '../../user/utils/user.types';
import { Sequelize } from 'sequelize-typescript';
import { DateRangeQueryType } from '../../../common/dto/datetime-query.dto';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezonePlugin from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezonePlugin);

@Injectable()
export class SalesInvoiceService extends BaseService<SalesInvoice> {
  constructor(
    @InjectModel(SalesInvoice) protected model: typeof SalesInvoice,
    private sequelize: Sequelize,
  ) {
    super(model);
  }

  async create(
    createOptions: CreateOptions,
    options?: TxOptions,
  ): Promise<SalesInvoice> {
    const user = createOptions.user;
    if (!user) {
      throw new InternalServerErrorException('User missing on create si');
    }

    return await this.model.create(
      {
        ...createOptions.createDto,
        createdBy: user.sub,
        updatedBy: user.sub,
      },
      {
        ...options,
        hooks: true,
      },
    );
  }

  async findOneForStore(id: string, storeId: string, options?: FindOptions) {
    const entity = await this.model.findOne({
      ...options,
      where: { id, storeId },
      include: [
        GET_SALESINVOICEITEM_INCLUDE(),
        {
          ...GET_USER_INCLUDE(),
          as: 'creator',
        },
      ],
    });
    return this.validateExisting(entity);
  }

  async findAndCountAll(
    findAllOptions: FindAllOptions<QuerySalesInvoiceDto>,
    pagination?: PaginationDto,
  ): Promise<{ rows: SalesInvoice[]; count: number }> {
    const { dateRange, timezone, startDate, endDate, ...filters } =
      findAllOptions.queryDto;

    const where: WhereOptions<SalesInvoice> = { ...filters };
    const selectedRange = dateRange ?? DateRangeQueryType.TODAY;
    const rangeTimezone = timezone ?? 'Asia/Jakarta';

    const now = dayjs().tz(rangeTimezone);
    
    let start: dayjs.Dayjs;
    let endExclusive: dayjs.Dayjs;

    if (selectedRange === DateRangeQueryType.LAST_30_DAYS) {
      start = now.subtract(30, 'day');
      endExclusive = now;
    } else if (selectedRange === DateRangeQueryType.CUSTOM) {
      start = dayjs.tz(startDate!, rangeTimezone).startOf('day');
      endExclusive = dayjs
        .tz(endDate!, rangeTimezone)
        .add(1, 'day')
        .startOf('day');
    } else {
      start = now.startOf('day');
      endExclusive = start.add(1, 'day');
    }

    where.createdAt = {
      [Op.gte]: start.toDate(),
      [Op.lt]: endExclusive.toDate(),
    };

    return await this.model.findAndCountAll({
      order: [['createdAt', 'desc']],
      where,
      include: [
        GET_SALESINVOICEITEM_INCLUDE(),
        {
          ...GET_USER_INCLUDE(),
          as: 'creator',
        },
      ],
      ...(pagination?.getPagination() ?? {}),
    });
  }

  async setStatusCompleted(id: string, user: UserAuthPayload, storeId: string) {
    const entity = await this.findOneForStore(id, storeId);
    if (user.role !== UserRole.ADMIN && user.sub !== entity.createdBy) {
      throw new ForbiddenException('Only creator can update this data');
    }

    return await entity.update({ status: SalesInvoiceStatus.COMPLETED });
  }
}
