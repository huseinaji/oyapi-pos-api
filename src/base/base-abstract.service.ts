import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  ObjectLiteral,
  QueryDeepPartialEntity,
  Repository,
} from 'typeorm';

export class BaseRepository<T extends ObjectLiteral> {
  constructor(protected readonly model: Repository<T>) {}

  create(data: DeepPartial<T>) {}
  findAll(options?: FindManyOptions<T>) {
    return this.model.find(options);
  }

  findOne(options: FindOneOptions<T>) {
    return this.model.findOne(options);
  }

  async update(id: string, data: QueryDeepPartialEntity<T>) {
    await this.model.update(id as any, data);

    return this.findOne({
      where: { id } as any,
    });
  }

  delete(id: string) {
    return this.model.delete(id);
  }
}
