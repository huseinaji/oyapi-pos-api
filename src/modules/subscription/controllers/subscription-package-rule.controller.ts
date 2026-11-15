import { Controller } from '@nestjs/common';
import { SubscriptionPackageRuleService } from '../services/subscription-package-rule.service';

@Controller({ path: 'subscription/package-rules', version: '1' })
export class SubscriptionPackageRuleController {
  constructor(
    private readonly subscriptionPackageRuleService: SubscriptionPackageRuleService,
  ) {}
}
