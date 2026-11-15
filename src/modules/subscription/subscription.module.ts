import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SubscriptionPackageController } from './controllers/subscription-package.controller';
import { SubscriptionPackageRuleController } from './controllers/subscription-package-rule.controller';
import { SubscriptionController } from './controllers/subscription.controller';
import { SubscriptionPackage } from './entities/subscription-package.entity';
import { SubscriptionPackageRule } from './entities/subscription-package-rule.entity';
import { Subscription } from './entities/subscription.entity';
import { SubscriptionPackageRuleService } from './services/subscription-package-rule.service';
import { SubscriptionPackageService } from './services/subscription-package.service';
import { SubscriptionService } from './services/subscription.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      SubscriptionPackage,
      SubscriptionPackageRule,
      Subscription,
    ]),
  ],
  controllers: [
    SubscriptionPackageController,
    SubscriptionPackageRuleController,
    SubscriptionController,
  ],
  providers: [
    SubscriptionPackageService,
    SubscriptionPackageRuleService,
    SubscriptionService,
  ],
  exports: [
    SubscriptionPackageService,
    SubscriptionPackageRuleService,
    SubscriptionService,
  ],
})
export class SubscriptionModule {}
