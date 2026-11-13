import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './controllers/user.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './entities/user.entity';
import { UserPublicController } from './controllers/user-public.controller';

@Module({
  imports: [SequelizeModule.forFeature([User])],
  controllers: [UserController, UserPublicController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
