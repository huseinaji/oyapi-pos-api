import { Model } from "sequelize-typescript";

export abstract class BaseAbstractService<T extends Model> {
  abstract create(createDto: any): Promise<T>;
  abstract findAll(queryDto: any): Promise<T[]>;
  abstract findOne(id: string, opt: any): Promise<T>;
  abstract update(
    id: string,
    updateDto: object,
    user?: any,
    options?: any,
  ): Promise<T>;
  abstract remove(id: string, options?: any, user?: any): Promise<boolean>;
}
