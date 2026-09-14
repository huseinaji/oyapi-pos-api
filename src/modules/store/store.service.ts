import { Injectable } from '@nestjs/common';
import { BaseService, FindAllOptions, TxOptions } from '../../common/base/base.service';
import { Store } from './entities/store.entity';
import { InjectModel } from '@nestjs/sequelize';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { GET_ENV_VARIABLE } from '../../common/utils/utils';
import { StoreMember } from './entities/store-member.entity';
import { StoreRole } from './utils/store.types';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class StoreService extends BaseService<Store> {
  constructor(
    @InjectModel(Store) protected model: typeof Store,
    @InjectModel(StoreMember) protected storeMemberModel: typeof StoreMember,
    private sequelize: Sequelize,
  ) {
    super(model)
  }

  findAndCountAll(
    findAllOptions: FindAllOptions,
    pagination?: PaginationDto,
    options?: TxOptions,
  ): Promise<{
    rows: Store[];
    count: number;
  }> {
    return this.model.findAndCountAll({
      where: { ...findAllOptions.queryDto },
      order: [['createdAt', 'DESC']],
      ...(pagination?.getPagination() ?? {}),
      ...options,
    });
  }

  async createInitialStore() {
    return await this.sequelize.transaction(async t => {
      const tx = { transaction: t };

      await this.model.create({
        id: GET_ENV_VARIABLE('INITIAL_STORE_ID'),
        name: 'My Store',
        address: 'localhouse',
        phone: '085156460160'
      }, tx);

      await this.storeMemberModel.create({
        storeId: GET_ENV_VARIABLE('INITIAL_STORE_ID'),
        role: StoreRole.ADMIN,
        userId: GET_ENV_VARIABLE('INITIAL_USER_ID'),
      }, tx)
    })
  }
}
