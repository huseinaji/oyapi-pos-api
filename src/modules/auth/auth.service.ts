import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { accessTokenPayload } from './utils/auth.type';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
  ) { }

  getSessionCacheKey(userId: string) {
    return `user:${userId}`;
  }

  private async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  private async validateUserLogin(dto: LoginDto): Promise<User> {
    const user = await this.userService.findByUsernameOrEmail(dto.usernameOrEmail);

    if (!user || !await this.comparePassword(dto.password, user.password)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user
  }

  async login(data: LoginDto) {
    const user = await this.validateUserLogin(data);
    const payload: accessTokenPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    }

    return payload;
  }

  async register(data: SignupDto) {
    const userExisting = await this.userService.findByUsernameOrEmail(data.email);

    if (userExisting) {
      throw new ConflictException('Email has been taken');
    }

    return await this.userService.create({
      ...data,
    })
  }
}
