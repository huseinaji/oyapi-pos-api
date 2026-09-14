import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RequestMethod, VersioningType } from '@nestjs/common/enums';
import cookieParser from 'cookie-parser';
import { Logger, ValidationPipe } from '@nestjs/common';
import { GET_ENV_VARIABLE } from './common/utils/utils';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Sequelize } from 'sequelize-typescript';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyCookie from '@fastify/cookie';
import fastifySession from '@fastify/session';
import fastifyCsrf from '@fastify/csrf-protection';
import Redis from 'ioredis';
import RedisStore from 'fastify-session-redis-store';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const redisClient = new Redis(GET_ENV_VARIABLE('REDIS_HOST'));
  const sessionStore = new RedisStore({
    client: redisClient,
    prefix: 'pos:session:',
  });

  const fastify = app.getHttpAdapter().getInstance();

  await fastify.register(fastifyCookie);

  await fastify.register(fastifyCsrf);

  await fastify.register(fastifySession, {
    secret: GET_ENV_VARIABLE('SESSION_SECRET'),
    cookieName: 'session',
    store: sessionStore,
    cookie: {
      httpOnly: true,
      secure: false, // true kalau production + HTTPS
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
      'http://192.168.1.10'],
    methods: ['PATCH', 'GET', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
  })

  const log = new Logger('system');

  const sequelize = app.get(Sequelize);

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

  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed', error);
    process.exit(1);
  }

  const config = new DocumentBuilder()
    .setTitle('POS-APP API')
    .setDescription('The POS-APP API documentation')
    .setVersion('1.0-DEVELOPMENT')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, document);

  log.debug(`APP running on environment: ${GET_ENV_VARIABLE('NODE_ENV', 'development')} || PORT: ${GET_ENV_VARIABLE('APP_PORT')}`)

  await app.listen(GET_ENV_VARIABLE('APP_PORT', '3000'), '0.0.0.0');
}
bootstrap();
