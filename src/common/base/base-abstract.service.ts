import { Model } from "sequelize-typescript";

export abstract class BaseAbstractService<T extends Model> {
  abstract create(createDto: any): Promise<T>;
  abstract findAll(queryDto: any): Promise<T[]>;
  abstract findOne(options: object): Promise<T>;
  abstract update(updateOptions: object): Promise<T>;
  abstract remove(removeOptions: object): Promise<boolean>;
  protected abstract validateExisting(entity: T | null): T;
}
