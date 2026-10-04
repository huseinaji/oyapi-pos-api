import { Injectable, InternalServerErrorException, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { BaseService, FindAllOptions, TxOptions } from '../../common/base/base.service';
import type { CreateOptions } from '../../common/base/base.service'
import { Store } from './entities/store.entity';
import { InjectModel } from '@nestjs/sequelize';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { GET_ENV_VARIABLE } from '../../common/utils';
import { StoreMember } from './entities/store-member.entity';
import { StoreRole } from './utils/store.types';
import { Sequelize } from 'sequelize-typescript';
import { CreateStoreDto } from './dto/create-store.dto';
import type { UserAuthPayload } from '../auth/utils/auth.type';
import { HandleSequelizeErrors } from '../../common/decorator/db-err-handler';
import { GET_USER_INCLUDE } from '../user/utils/user.include';
import { UserRole } from '../user/utils/user.types';
import { GET_STORE_MEMBER_INCLUDE } from './utils/store-member.include';
import { Op } from 'sequelize';

@Injectable()
export class StoreService extends BaseService<Store> {
  constructor(
    @InjectModel(Store) protected model: typeof Store,
    @InjectModel(StoreMember) protected storeMemberModel: typeof StoreMember,
    private sequelize: Sequelize,
  ) {
    super(model)
  }

  async getMemberData(id: string, userId: string, options?: TxOptions) {
    return await this.storeMemberModel.findOne({
      where: { storeId: id, userId },
      ...options,
    });
  }

  private async createInitialStoreMember(id: string, user: UserAuthPayload, options?: TxOptions) {
    if (![UserRole.ADMIN].includes(user.role)) {
      await this.storeMemberModel.create({
        storeId: id,
        userId: GET_ENV_VARIABLE('INITIAL_USER_ID'),
        role: StoreRole.ADMIN,
      }, options);
    }

    return await this.storeMemberModel.create({
      storeId: id,
      userId: user.sub,
      role: StoreRole.ADMIN
    }, options);
  }

  @HandleSequelizeErrors()
  async create(createOptions: CreateOptions<CreateStoreDto>): Promise<Store> {
    const dto = createOptions.createDto;
    const user = createOptions.user;

    if (!user) throw new InternalServerErrorException('User missing create store');

    return this.sequelize.transaction(async t => {
      const tx = { transaction: t };

      const store = await this.model.create({
        ...dto,
        createdBy: user.sub,
      }, tx)

      await this.createInitialStoreMember(store.id, user, tx);

      return store;
    })
  }

  @HandleSequelizeErrors()
  async assignMember(id: string, userId: string) {
    return this.sequelize.transaction(async t => {
      const tx = { transaction: t };

      const member = await this.getMemberData(id, userId, tx);

      if (member) {
        throw new UnprocessableEntityException('User has already assigned to this store');
      }

      return await this.storeMemberModel.create({
        storeId: id,
        userId,
        role: StoreRole.CASHIER
      })
    });
  }

  async getMembers(id: string) {
    return await this.storeMemberModel.findAndCountAll({
      where: {
        storeId: id
      },
      include: [
        {
          ...GET_USER_INCLUDE(),
          required: true,
          where: {
            role: { [Op.ne]: UserRole.ADMIN }
          }
        }
      ],
    })
  }

  async selectStore(id: string, user: UserAuthPayload) {
    const storeData = await this.findOne({ id });
    const userMember = await this.getMemberData(id, user.sub);

    if (!userMember) throw new NotFoundException('You are not member of this store')

    return {
      store: storeData.get({ plain: true }),
      role: userMember.role,
    };
  }

  getMyStore(userContext: UserAuthPayload, pagination?: PaginationDto) {
    return this.model.findAndCountAll({
      include: [
        {
          ...GET_STORE_MEMBER_INCLUDE(),
          required: true,
          where: {
            userId: userContext.sub
          }
        }
      ],
      ...(pagination?.getPagination() ?? {})
    })
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
      include: [
        GET_USER_INCLUDE(),
        GET_STORE_MEMBER_INCLUDE(),
      ],
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
