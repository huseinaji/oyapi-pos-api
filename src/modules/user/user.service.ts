import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}
  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepo.create(createUserDto);

    return await this.userRepo.save(user);
  }

  findAll() {
    return this.userRepo.find();
  }

  async findByUsernameOrEmail(usernameOrEmail: string) {
    return await this.userRepo.findOne({
      where: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, data: UpdateUserDto) {
    const user = await this.findOne(id);

    Object.assign(user, data);
    return await this.userRepo.save(user);
  }

  async remove(id: string) {
    const user = await this.findOne(id);

    const result = await this.userRepo.delete(id);

    if (!result.affected) {
      throw new NotFoundException('User not found');
    }
  }
}
