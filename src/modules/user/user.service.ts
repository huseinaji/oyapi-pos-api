import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { BaseUserDto } from './dto/base-user.dto';
import { UserRole, UserStatus } from './utils/user.types';
import { GET_ENV_VARIABLE } from '../../common/utils/utils';
import { QueryUserDto } from './dto/query-user.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class UserService implements OnModuleInit {
  constructor(
    @InjectModel(User) private readonly model: typeof User,
  ) { }

  create(createUserDto: CreateUserDto): Promise<User> {
    return this.model.create({ ...createUserDto } as any);
  }

  async findAll(query: QueryUserDto, pagination?: PaginationDto) {
    return await this.model.findAndCountAll({
      where: { ...query },
      ...(pagination?.getPagination() ?? {})
    });
  }

  findByUsernameOrEmail(usernameOrEmail: string): Promise<User | null> {
    return this.model.findOne({
      where: {
        [Op.or]: [
          { username: usernameOrEmail },
          { email: usernameOrEmail },
        ],
      },
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.model.findByPk(id);
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

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await user.destroy();
  }

  private async createAdminUser() {
    const userData: BaseUserDto = {
      id: GET_ENV_VARIABLE('INITIAL_USER_ID'),
      username: 'administrator',
      email: 'admin@mail.com',
      password: GET_ENV_VARIABLE('ADMIN_PASS'),
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    }

    return await this.model.create({ ...userData }, { ignoreDuplicates: true });
  }

  async onModuleInit() {
    await this.createAdminUser();
  }
}
