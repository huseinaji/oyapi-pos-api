export enum SubscriptionPackageCode {
  FREE = 'free',
  PRO = 'pro',
  PRO_PLUS = 'pro_plus',
}

export enum SubscriptionRuleValueType {
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  STRING = 'string',
  JSON = 'json',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  EXPIRED = 'expired',
  PENDING = 'pending',
}

export enum SubscriptionRuleKey {
  MAX_STORES = 'maxStores',
  MAX_MEMBERS_PER_STORE = 'maxMembersPerStore',
  POS_ENABLED = 'posEnabled',
}
