import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { Logger, RequestMethod, ValidationPipe, VersioningType } from '@nestjs/common';
import { GET_ENV_VARIABLE } from './common/utils';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Sequelize } from 'sequelize-typescript';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyCookie from '@fastify/cookie';
import fastifySession from '@fastify/session';
import Redis from 'ioredis';
import RedisStore from 'fastify-session-redis-store';

const IS_PROD = ['staging', 'production'].includes(GET_ENV_VARIABLE('NODE_ENV'));

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.enableCsrfProtection();

  const redisClient = new Redis(GET_ENV_VARIABLE('REDIS_HOST'));
  const sessionStore = new RedisStore({
    client: redisClient,
    prefix: 'pos:session:',
  });

  const fastify = app.getHttpAdapter().getInstance();

  await fastify.register(fastifyCookie);

  await fastify.register(fastifySession, {
    secret: GET_ENV_VARIABLE('SESSION_SECRET'),
    store: sessionStore,
    cookie: {
      httpOnly: true,
      secure: !IS_PROD ? false : true, // true kalau production + HTTPS
      sameSite: 'strict',
      path: '/',
    },
  });

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3003',
      'http://192.168.1.13:3000',
      'http://192.168.1.13:3003',
      'http://192.168.1.9:3003',
      'http://192.168.1.10'],
    methods: ['PATCH', 'GET', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
  })

  const log = new Logger('system');

  console.log(typeof Bun !== 'undefined');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: {
        enableImplicitConversion: false,
      },
    }),
  );

  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.use(cookieParser());
  app.setGlobalPrefix('api/', {
    exclude: [
      {
        path: '',
        method: RequestMethod.GET
      }
    ]
  });
  
  const config = new DocumentBuilder()
    .setTitle('POS-APP API')
    .setDescription('The POS-APP API documentation')
    .setVersion('1.0-DEVELOPMENT')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, document);

  log.debug(`APP running on environment: ${GET_ENV_VARIABLE('NODE_ENV')} || PORT: ${GET_ENV_VARIABLE('APP_PORT')}`)

  await app.listen(GET_ENV_VARIABLE('APP_PORT', '3000'), '0.0.0.0');
}
bootstrap();
