import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  BaseService,
  FindAllOptions,
  TxOptions,
} from '../../common/base/base.service';
import type { CreateOptions } from '../../common/base/base.service';
import { Store } from './entities/store.entity';
import { InjectModel } from '@nestjs/sequelize';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { GET_ENV_VARIABLE } from '../../common/utils';
import { StoreMember } from './entities/store-member.entity';
import { StoreMemberStatus, StoreRole, StoreStatus } from './utils/store.types';
import { Sequelize } from 'sequelize-typescript';
import { CreateStoreDto } from './dto/store-dto/create-store.dto';
import type { UserAuthPayload } from '../auth/utils/auth.type';
import { HandleSequelizeErrors } from '../../common/decorator/db-err-handler';
import { GET_USER_INCLUDE } from '../user/utils/user.include';
import { UserRole } from '../user/utils/user.types';
import { GET_STORE_MEMBER_INCLUDE } from './utils/store-member.include';
import { FindOptions, Op } from 'sequelize';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PosSessionEntryService } from '../point-of-sale/services/pos-session-entry.service';
import { BaseStoreMemberDto } from './dto/store-member-dto/base-store-member.dto';

@Injectable()
export class StoreService extends BaseService<Store> {
  private logger = new Logger(StoreService.name);
  constructor(
    @InjectModel(Store) protected model: typeof Store,
    @InjectModel(StoreMember) protected storeMemberModel: typeof StoreMember,
    private sequelize: Sequelize,
    private posSessionService: PosSessionEntryService,
  ) {
    super(model);
  }

  async getMemberData(id: string, userId: string, options?: TxOptions) {
    return await this.storeMemberModel.findOne({
      where: { storeId: id, userId },
      ...options,
    });
  }

  private async createInitialStoreMember(
    id: string,
    user: UserAuthPayload,
    options?: TxOptions,
  ) {
    if (![UserRole.ADMIN].includes(user.role)) {
      await this.storeMemberModel.create(
        {
          storeId: id,
          userId: GET_ENV_VARIABLE('INITIAL_USER_ID'),
          role: StoreRole.ADMIN,
        },
        options,
      );
    }

    return await this.storeMemberModel.create(
      {
        storeId: id,
        userId: user.sub,
        role: StoreRole.ADMIN,
      },
      options,
    );
  }

  @HandleSequelizeErrors()
  async create(createOptions: CreateOptions<CreateStoreDto>): Promise<Store> {
    const dto = createOptions.createDto;
    const user = createOptions.user;

    if (!user)
      throw new InternalServerErrorException('User missing create store');

    return this.sequelize.transaction(async (t) => {
      const tx = { transaction: t };

      const store = await this.model.create(
        {
          ...dto,
          createdBy: user.sub,
        },
        tx,
      );

      await this.createInitialStoreMember(store.id, user, tx);

      return store;
    });
  }

  @HandleSequelizeErrors()
  async assignMember(id: string, userId: string) {
    return this.sequelize.transaction(async (t) => {
      const tx = { transaction: t };

      const member = await this.getMemberData(id, userId, tx);

      if (member) {
        if (member.status === StoreMemberStatus.INACTIVE) {
          member.status = StoreMemberStatus.ACTIVE;
          await member.save(tx);

          return member;
        }

        throw new UnprocessableEntityException(
          'User has already assigned to this store',
        );
      }

      return await this.storeMemberModel.create({
        storeId: id,
        userId,
        role: StoreRole.CASHIER,
      });
    });
  }

  async updateMember(
    memberId: string,
    storeId: string,
    data: Partial<Omit<BaseStoreMemberDto, 'storeId'>>,
  ) {
    return this.sequelize.transaction(async (t) => {
      const tx = { transaction: t };

      const memberData = await this.storeMemberModel.findOne({
        where: { id: memberId, storeId },
        lock: t.LOCK.UPDATE,
        ...tx,
      });

      if (!memberData) throw new NotFoundException('Member data not found');

      return memberData.update(data, tx);
    });
  }

  @HandleSequelizeErrors()
  async inactivateMember(id: string, userId: string) {
    return this.sequelize.transaction(async (t) => {
      const tx = { transaction: t };

      const member = await this.getMemberData(id, userId, tx);
      if (!member) {
        throw new NotFoundException('User is not member of this store');
      }

      member.status = StoreMemberStatus.INACTIVE;
      await member.save(tx);
      return member;
    });
  }

  async getMembers(id: string) {
    return await this.storeMemberModel.findAndCountAll({
      where: {
        storeId: id,
      },
      include: [
        {
          ...GET_USER_INCLUDE(),
          required: true,
          where: {
            role: { [Op.ne]: UserRole.ADMIN },
          },
        },
      ],
    });
  }

  getMyStore(userContext: UserAuthPayload, pagination?: PaginationDto) {
    return this.model.findAndCountAll({
      include: [
        {
          ...GET_STORE_MEMBER_INCLUDE(),
          required: true,
          where: {
            userId: userContext.sub,
            status: StoreMemberStatus.ACTIVE,
          },
        },
      ],
      ...(pagination?.getPagination() ?? {}),
    });
  }

  async findOne(id: string, options?: FindOptions): Promise<Store> {
    const result = await this.model.findOne({
      where: { id },
      include: [
        GET_USER_INCLUDE(),
        {
          ...GET_STORE_MEMBER_INCLUDE(),
          where: {
            userId: { [Op.ne]: GET_ENV_VARIABLE('INITIAL_USER_ID') },
          },
        },
      ],
      ...options,
    });

    return this.validateExisting(result);
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
        {
          ...GET_STORE_MEMBER_INCLUDE(),
          limit: 3,
        },
      ],
      ...(pagination?.getPagination() ?? {}),
      ...options,
    });
  }

  private async autocloseSession() {
    const storeData = await this.model.findAll({
      where: {
        status: StoreStatus.ACTIVE,
      },
    });

    const results = await Promise.allSettled(
      storeData.map((store) =>
        this.posSessionService.closePos(
          store.id,
          GET_ENV_VARIABLE('INITIAL_USER_ID'),
        ),
      ),
    );

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        this.logger.warn(
          `Failed to auto-close POS session ${storeData[index].id}: ${result.reason}`,
        );
      }
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { timeZone: 'Asia/Jakarta' })
  protected async cronMidnight() {
    await this.autocloseSession();
  }
}
