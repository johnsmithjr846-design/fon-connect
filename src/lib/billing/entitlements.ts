export type ActiveSubscription = {
  id: string;
  plan_id: string;
  status: string;
  start_at: string;
  expires_at: string | null;
  auto_renew: boolean;
  cancel_at_period_end: boolean;
  payment_state?: string | null;
  grace_until?: string | null;
};

export type Entitlements = {
  lessonsPro: boolean;
  translationPremium: boolean;
  unlimitedHearts: boolean;
  plans: string[];
  subscriptions: ActiveSubscription[];
  /** Un prélèvement a échoué : accès maintenu pendant le délai de grâce. */
  paymentIssue: boolean;
  graceUntil: string | null;
};

export const FREE_ENTITLEMENTS: Entitlements = {
  lessonsPro: false,
  translationPremium: false,
  unlimitedHearts: false,
  plans: [],
  subscriptions: [],
  paymentIssue: false,
  graceUntil: null,
};
