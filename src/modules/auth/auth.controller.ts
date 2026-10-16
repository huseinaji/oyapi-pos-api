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
import { ApiOperation } from '@nestjs/swagger';

@SessionFree()
@Controller({ path: 'auth', version: "1" })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private cacheService: CacheService,
  ) { }

  @Public()
  @ApiOperation({ summary: 'Sign in', description: 'Authenticates with a username or email and password, then establishes the session cookie.' })
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
  @ApiOperation({ summary: 'Register an account', description: 'Creates a user account with the submitted username, email, password, and role.' })
  @Post('register')
  register(@Body() data: SignupDto) {
    return this.authService.register(data)
  }

  @ApiOperation({ summary: 'Get the current user', description: 'Returns the authenticated user and session payload.' })
  @Get('me')
  profile(@Req() req: FastifyRequest) {
    return req['user'];
  }

  @ApiOperation({ summary: 'Sign out', description: 'Destroys the current authenticated session.' })
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
