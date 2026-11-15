import { Controller } from '@nestjs/common';
import { SubscriptionService } from '../services/subscription.service';

@Controller({ path: 'subscriptions', version: '1' })
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}
}
