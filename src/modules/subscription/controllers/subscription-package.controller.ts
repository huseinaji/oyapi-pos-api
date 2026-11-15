import { Controller } from '@nestjs/common';
import { SubscriptionPackageService } from '../services/subscription-package.service';

@Controller({ path: 'subscription/packages', version: '1' })
export class SubscriptionPackageController {
  constructor(
    private readonly subscriptionPackageService: SubscriptionPackageService,
  ) {}
}
