import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RequestMethod, VersioningType } from '@nestjs/common/enums';
import cookieParser from 'cookie-parser';
import { Logger, ValidationPipe, Version } from '@nestjs/common';
import { GET_ENV_VARIABLE } from './config/env.config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
    
  log.debug(`APP running on environment: ${GET_ENV_VARIABLE('NODE_ENV', 'development')}`)

  app.enableVersioning({type: VersioningType.URI})
  await app.listen(GET_ENV_VARIABLE('APP_PORT', '3000'));
}
bootstrap();
