import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
  ) {}

  async validateUser(usernameOrEmail: string, pass: string) {
    const userData = await this.userService.findByUsernameOrEmail(usernameOrEmail);
    if (userData && userData.password === pass) {
      const { password, ...result } = userData;
      return result;
    }
    return null;
  }
}
