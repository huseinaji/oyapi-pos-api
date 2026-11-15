import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BaseService } from '../../../common/base/base.service';
import { SubscriptionPackageRule } from '../entities/subscription-package-rule.entity';

@Injectable()
export class SubscriptionPackageRuleService extends BaseService<SubscriptionPackageRule> {
  constructor(
    @InjectModel(SubscriptionPackageRule)
    protected model: typeof SubscriptionPackageRule,
  ) {
    super(model);
  }
}
