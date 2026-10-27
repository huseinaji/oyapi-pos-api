import { Model, ModelCtor } from 'sequelize-typescript';
import { BaseAbstractService } from './base-abstract.service';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { FindOptions, Transaction, UniqueConstraintError } from 'sequelize';
import { PaginationDto } from '../dto/pagination.dto';
import { UserAuthPayload } from '../../modules/auth/utils/auth.type';

export interface TxOptions {
  transaction: Transaction
}

export interface CreateOptions<TDto = any> {
  createDto: TDto;
  user?: UserAuthPayload;
}

export interface FindAllOptions<TDto = any> {
  queryDto: TDto;
}

export abstract class BaseService<
  T extends Model,
> extends BaseAbstractService<T> {
  constructor(protected readonly model: ModelCtor<T>) {
    super();
  }
  async create(createOptions: CreateOptions, options?: TxOptions): Promise<T> {
    try {
      const createDto = { ...createOptions.createDto };
      if (
        createOptions.user &&
        Object.keys(this.model.getAttributes()).includes('createdBy')
      ) {
        Object.assign(createDto, { createdBy: createOptions.user.sub });
      }
      return await this.model.create(createDto, options);
    } catch (err) {
      if (err instanceof UniqueConstraintError) {
        const errors = err.errors.map((e) => ({
          field: e.path,
          value: e.value,
          message: e.message,
        }));

        throw new ConflictException({
          message: 'Duplicate entry',
          errors,
        });
      }
      throw err;
    }
  }

  findAll(
    findAllOptions: FindAllOptions,
    pagination?: PaginationDto,
  ): Promise<T[]> {
    return this.model.findAll({
      where: { ...findAllOptions.queryDto },
      order: [['createdAt', 'DESC']],
      ...(pagination?.getPagination() ?? {}),
    });
  }

  findAndCountAll(
    findAllOptions: FindAllOptions,
    pagination?: PaginationDto,
    options?: TxOptions,
  ): Promise<{
    rows: T[];
    count: number;
  }> {
    return this.model.findAndCountAll({
      where: { ...findAllOptions.queryDto },
      order: [['createdAt', 'DESC']],
      ...(pagination?.getPagination() ?? {}),
      ...options,
    });
  }

  async findOne(
    id: string,
    options?: FindOptions,
  ): Promise<T> {
    const entity = await this.model.findByPk(id, {
      ...options,
    });
    return this.validateExisting(entity);
  }

  async update<TDto extends object>(
    id: string,
    updateDto: TDto,
    opt?: { user?: UserAuthPayload; tx?: TxOptions },
  ): Promise<T> {
    const hasValue = Object.values(updateDto).some(
      (value) => value !== undefined,
    );

    if (!hasValue) {
      throw new BadRequestException('Request body cannot be empty');
    }

    const entity = await this.findOne(id, opt?.tx);

    if (
      opt?.user &&
      Object.keys(this.model.getAttributes()).includes('updatedBy')
    ) {
      await entity.update({ ...updateDto, updatedBy: opt.user.sub }, opt.tx);
    } else {
      await entity.update({ ...updateDto }, opt?.tx);
    }

    return entity;
  }

  async remove(
    id: string,
    opt?: { user?: UserAuthPayload; tx?: TxOptions },
  ): Promise<boolean> {
    const entity = await this.findOne(id, opt?.tx);
    if (
      opt?.user &&
      Object.keys(this.model.getAttributes()).includes('updatedBy')
    ) {
      await entity.update({ updatedBy: opt.user.sub }, opt.tx);
    }
    await entity.destroy(opt?.tx);
    return true;
  }

  protected validateExisting(entity: T | null): T {
    if (!entity) {
      throw new NotFoundException(`${this.model.name} not found`);
    }
    return entity;
  }
}
