import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { UserAuthPayload } from './utils/auth.type';
import { LoginDto } from './dto/login.dto';
import { User } from '../user/entities/user.entity';
import { SignupDto } from './dto/signup.dto';
import { HandleSequelizeErrors } from '../../common/decorator/db-err-handler';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
  ) { }

  getSessionCacheKey(userId: string) {
    return `user:${userId}`;
  }

  private async comparePassword(password: string, hash: string): Promise<boolean> {
    return await Bun.password.verify(password, hash);
  }

  private async validateUserLogin(dto: LoginDto): Promise<User> {
    const user = await this.userService.findByUsernameOrEmail(dto.usernameOrEmail);

    if (!user || !await this.comparePassword(dto.password, user.password)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user
  }

  async login(data: LoginDto): Promise<UserAuthPayload> {
    const user = await this.validateUserLogin(data);

    await this.userService.setUserLogin(user.id);

    const payload: UserAuthPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
    }

    return payload;
  }

  @HandleSequelizeErrors()
  async register(data: SignupDto) {
    return await this.userService.create({
      ...data,
    })
  }
}
