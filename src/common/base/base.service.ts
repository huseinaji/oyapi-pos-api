import { Model, ModelCtor } from 'sequelize-typescript';
import { BaseAbstractService } from './base-abstract.service';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { FindOptions, Transaction, UniqueConstraintError } from 'sequelize';
import { PaginationDto } from '../dto/pagination.dto';
import { accessTokenPayload } from '../../modules/auth/utils/auth.type';

export interface TxOptions {
  transaction: Transaction
}
export interface UpdateOptions<TDto = any> {
  id: string;
  updateDto: TDto;
  user?: accessTokenPayload;
}

export interface CreateOptions<TDto = any> {
  createDto: TDto;
  user?: accessTokenPayload;
}

export interface FindOneOptions {
  id: string;
  user?: accessTokenPayload;
}

export interface FindAllOptions<TDto = any> {
  queryDto: TDto;
  user?: accessTokenPayload;
}

export interface RemoveOptions {
  id: string;
  user?: accessTokenPayload;
}

export abstract class BaseService<
  T extends Model,
> extends BaseAbstractService<T> {
  constructor(protected readonly model: ModelCtor<T>) {
    super();
  }
  async create(createOptions: CreateOptions, options?: TxOptions): Promise<T> {
    try {
      if (
        createOptions.user &&
        Object.keys(this.model.getAttributes()).includes('createdBy')
      ) {
        createOptions.createDto.createdBy = createOptions.user.sub;
      }
      return await this.model.create({ ...createOptions.createDto }, options);
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
    findOneOptions: FindOneOptions,
    options?: FindOptions,
  ): Promise<T> {
    const entity = await this.model.findByPk(findOneOptions.id, {
      ...options,
    });
    return this.validateExisting(entity);
  }

  async update(updateOptions: UpdateOptions, options?: TxOptions): Promise<T> {
    const hasValue = Object.values(updateOptions.updateDto).some(
      (value) => value !== undefined,
    );

    if (!hasValue) {
      throw new BadRequestException('Request body cannot be empty');
    }

    const entity = await this.findOne(
      { id: updateOptions.id, user: updateOptions.user },
      options,
    );

    if (
      updateOptions.user &&
      Object.keys(this.model.getAttributes()).includes('updatedBy')
    ) {
      updateOptions.updateDto.updatedBy = updateOptions.user.sub;
    }

    await entity.update({ ...updateOptions.updateDto }, options);
    return entity;
  }

  async remove(
    removeOptions: RemoveOptions,
    options?: TxOptions,
  ): Promise<boolean> {
    const entity = await this.findOne({ id: removeOptions.id }, options);
    // if entity has updatedBy field, update it with userId from removeOptions before deleting, otherwise just delete
    if ('updatedBy' in entity.dataValues) {
      await entity.update({ updatedBy: removeOptions.user?.sub }, options);
    }
    await entity.destroy(options);
    return true;
  }

  protected validateExisting(entity: T | null): T {
    if (!entity) {
      throw new NotFoundException(`${this.model.name} not found`);
    }
    return entity;
  }
}
