import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BaseService } from '../../../common/base/base.service';
import { Subscription } from '../entities/subscription.entity';

@Injectable()
export class SubscriptionService extends BaseService<Subscription> {
  constructor(
    @InjectModel(Subscription) protected model: typeof Subscription,
  ) {
    super(model);
  }
}
