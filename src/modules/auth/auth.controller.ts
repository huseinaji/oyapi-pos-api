import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { Public } from '../../common/decorator/decorator';
import { accessTokenPayload } from './utils/auth.type';
import type { FastifyReply, FastifyRequest } from 'fastify';
import '@fastify/session';
import { CsrfService } from './csrf.service';

declare module 'fastify' {
  interface Session {
    payload: accessTokenPayload;
    rememberMe: boolean;
    csrfToken: string;
  }
}

@Controller({ path: 'auth', version: "1" })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly csrfService: CsrfService,
  ) { }

  @Public()
  @Get('csrf')
  getCsrfToken(@Req() req: FastifyRequest) {
    if (!req.session.csrfToken) {
      req.session.csrfToken =
        this.csrfService.generateToken();
    }

    return {
      csrfToken: req.session.csrfToken,
    };
  }

  @Public()
  @Post('login')
  async login(
    @Body() data: LoginDto,
    @Req() req: FastifyRequest,
  ) {
    const payload = await this.authService.login(data);

    req.session.payload = payload;
    req.session.rememberMe = data.rememberMe;

    if (data.rememberMe) {
      req.session.cookie.maxAge =
        30 * 24 * 60 * 60 * 1000;
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
    return req.user;
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
