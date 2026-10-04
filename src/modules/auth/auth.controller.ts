import { Body, Controller, Get, Post, Req, Res, Session } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { Public, SessionFree } from '../../common/decorator/decorator';
import { RedisSessionData, UserAuthPayload } from './utils/auth.type';
import type { FastifyReply, FastifyRequest } from 'fastify';
import '@fastify/session';
import { CacheService } from '../../infrastructure/redis-provider/redis-cache.service';
import { type FastifySessionObject } from '@fastify/session';

@SessionFree()
@Controller({ path: 'auth', version: "1" })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private cacheService: CacheService,
  ) { }

  @Public()
  @Post('login')
  async login(
    @Body() data: LoginDto,
    @Session() session: FastifySessionObject,
  ) {
    const payload: UserAuthPayload = await this.authService.login(data);

    session.payload = {
      userPayload: payload,
      rememberMe: data.rememberMe,
    }

    const redisSessionData: RedisSessionData = {
      sessionId: session.sessionId,
      ...session.payload,
    }

    this.cacheService.set(`user:${payload.sub}:session`, JSON.stringify(redisSessionData));

    if (data.rememberMe) {
      session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
    }

    return {
      message: 'success',
    }
  }

  @Public()
  @Post('register')
  register(@Body() data: SignupDto) {
    return this.authService.register(data)
  }

  @Get('me')
  profile(@Req() req: FastifyRequest) {
    return req['user'];
  }

  @Post('logout')
  async logout(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    await req.session.destroy();

    res.clearCookie('sessionIdsessionId', {
      path: '/',
    });

    return {
      message: 'success',
    }
  }
}
