import { Module } from '@nestjs/common';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Store } from './entities/store.entity';
import { StoreMember } from './entities/store-member.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([Store, StoreMember])
  ],
  controllers: [StoreController],
  providers: [StoreService],
})
export class StoreModule { }
