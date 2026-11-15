import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BaseService } from '../../../common/base/base.service';
import { SubscriptionPackage } from '../entities/subscription-package.entity';

@Injectable()
export class SubscriptionPackageService extends BaseService<SubscriptionPackage> {
  constructor(
    @InjectModel(SubscriptionPackage)
    protected model: typeof SubscriptionPackage,
  ) {
    super(model);
  }
}
