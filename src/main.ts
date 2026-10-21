import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import {
  Logger,
  RequestMethod,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { GET_ENV_VARIABLE } from './common/utils';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyCookie from '@fastify/cookie';
import fastifySession from '@fastify/session';
import Redis from 'ioredis';
import RedisStore from 'fastify-session-redis-store';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

const IS_PROD = GET_ENV_VARIABLE('NODE_ENV') === 'production';
const CORS_ORIGINS = GET_ENV_VARIABLE('CORS_ORIGINS', '')
  ?? GET_ENV_VARIABLE('CORS_ORIGINS').split(',')
      .map((origin) => origin.trim())
      .filter(Boolean)

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
      sameSite: 'lax',
      path: '/',
    },
  });

  app.enableCors({
    origin: CORS_ORIGINS,
    methods: ['PATCH', 'GET', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  const log = new Logger('system');

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

  if (IS_PROD) {
    app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  }

  app.setGlobalPrefix('api/', {
    exclude: [
      {
        path: '',
        method: RequestMethod.GET,
      },
    ],
  });

  if (!IS_PROD || GET_ENV_VARIABLE('ENABLE_SWAGGER') === 'true') {
    const config = new DocumentBuilder()
      .setTitle('POS-APP API')
      .setDescription('The POS-APP API documentation')
      .setVersion('1.0')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('doc', app, document);
  }

  log.log(
    `APP running on environment: ${GET_ENV_VARIABLE('NODE_ENV')} || PORT: ${GET_ENV_VARIABLE('APP_PORT', '3000')}`,
  );

  app.enableShutdownHooks();
  await app.listen(GET_ENV_VARIABLE('APP_PORT', '3000'), '0.0.0.0');
}
bootstrap();
