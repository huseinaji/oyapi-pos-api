import { ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  BaseService,
  CreateOptions,
  FindAllOptions,
  FindOneOptions,
  TxOptions,
} from '../../../common/base/base.service';
import { InjectModel } from '@nestjs/sequelize';
import { SalesInvoice } from '../entities/sales-invoice.entity';
import { FindOptions } from 'sequelize';
import { GET_SALESINVOICEITEM_INCLUDE } from '../utils/sales-invoice-item.include';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { QuerySalesInvoiceDto } from '../dto/query-sales-invoice.dto';
import { GET_USER_INCLUDE } from '../../user/utils/user.include';
import { accessTokenPayload } from '../../auth/utils/auth.type';
import { SalesInvoiceStatus } from '../utils/pos.type';
import { UserRole } from '../../user/utils/user.types';

@Injectable()
export class SalesInvoiceService extends BaseService<SalesInvoice> {
  constructor(@InjectModel(SalesInvoice) protected model: typeof SalesInvoice) {
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

  async findOne(findOneOptions: FindOneOptions, options?: FindOptions) {
    const entity = await this.model.findByPk(findOneOptions.id, {
      ...options,
      include: [
        GET_SALESINVOICEITEM_INCLUDE(),
        {
          ...GET_USER_INCLUDE(),
          as: 'creator'
        }
      ],
    });
    return this.validateExisting(entity);
  }

  async findAndCountAll(
    findAllOptions: FindAllOptions<QuerySalesInvoiceDto>,
    pagination?: PaginationDto,
  ): Promise<{ rows: SalesInvoice[]; count: number }> {
    return await this.model.findAndCountAll({
      where: {
        ...findAllOptions.queryDto,
      },
      include: [
        GET_SALESINVOICEITEM_INCLUDE(),
        {
          ...GET_USER_INCLUDE(),
          as: 'creator'
        }
      ],
      ...(pagination?.getPagination() ?? {}),
    });
  }

  async setStatusCompleted(id: string, user: accessTokenPayload) {
    const entity = await this.findOne({ id });

    if (user.role !== UserRole.ADMIN && user.sub !== entity.createdBy) {
      throw new ForbiddenException('Only creator can update this data');
    }

    return await entity.update({ status: SalesInvoiceStatus.COMPLETED })
  }
}
