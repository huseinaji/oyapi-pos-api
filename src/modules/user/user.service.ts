import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { BaseUserDto } from './dto/base-user.dto';
import { UserRole, UserStatus } from './utils/user.types';
import { GET_ENV_VARIABLE } from '../../common/utils';
import { QueryUserDto } from './dto/query-user.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { GET_STORE_MEMBER_INCLUDE } from '../store/utils/store-member.include';
import { GET_STORE_INCLUDE } from '../store/utils/store.include';

@Injectable()
export class UserService implements OnModuleInit {
  private logger = new Logger(UserService.name)
  constructor(@InjectModel(User) private readonly model: typeof User) { }

  create(createUserDto: CreateUserDto): Promise<User> {
    return this.model.create({ ...createUserDto } as any);
  }

  async findAll(query: QueryUserDto, pagination?: PaginationDto) {
    return await this.model.findAndCountAll({
      where: { ...query },
      include: [
        {
          ...GET_STORE_MEMBER_INCLUDE(),
          limit: 3,
          include: [
            GET_STORE_INCLUDE()
          ]
        },
      ],
      ...(pagination?.getPagination() ?? {}),
    });
  }

  findByUsernameOrEmail(usernameOrEmail: string): Promise<User | null> {
    return this.model.findOne({
      where: {
        [Op.or]: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      },
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.model.findByPk(id, {
      include: [
        {
          ...GET_STORE_MEMBER_INCLUDE(),
          include: [
            GET_STORE_INCLUDE()
          ]
        }
      ],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: string, data: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    await user.update({ ...data });
    return user;
  }

  setUserLogin(id: string) {
    return this.model.update({
      lastLogin: Date.now(),
    }, {
      where: { id }
    })
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await user.destroy();
  }

  private async createAdminUser() {
    const userData: Omit<BaseUserDto, 'lastLogin'> = {
      id: GET_ENV_VARIABLE('INITIAL_USER_ID'),
      username: 'administrator',
      email: 'admin@mail.com',
      password: GET_ENV_VARIABLE('ADMIN_PASS'),
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    };

    const existingUser = await this.model.findOne({
      where: {
        username: userData.username,
      },
    });

    if (existingUser) {
      this.logger.debug('Admin has been created');
      return
    }
    return await this.model.create({ ...userData }, { ignoreDuplicates: true });
  }

  async onModuleInit() {
    await this.createAdminUser();
  }
}
