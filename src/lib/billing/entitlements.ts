export type ActiveSubscription = {
  id: string;
  plan_id: string;
  status: string;
  start_at: string;
  expires_at: string | null;
  auto_renew: boolean;
  cancel_at_period_end: boolean;
};

export type Entitlements = {
  lessonsPro: boolean;
  translationPremium: boolean;
  unlimitedHearts: boolean;
  plans: string[];
  subscriptions: ActiveSubscription[];
};

export const FREE_ENTITLEMENTS: Entitlements = {
  lessonsPro: false,
  translationPremium: false,
  unlimitedHearts: false,
  plans: [],
  subscriptions: [],
};
