import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductModule } from './modules/product/product.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { ConfigModule } from '@nestjs/config';
import { getDbConfig } from './config/database.config';
import { TicketModule } from './modules/ticket/ticket.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(getDbConfig()),
    UserModule, 
    AuthModule, 
    ProductModule, TicketModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
