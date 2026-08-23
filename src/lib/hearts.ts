export type HeartGrantKind = "free" | "paid";

export type HeartGrant = {
  id: string;
  user_id: string;
  amount: number;
  hearts_remaining: number;
  kind: HeartGrantKind;
  reason: string;
  starts_at: string;
  expires_at: string;
  revoked_at: string | null;
  created_at: string;
};

export type HeartGrantStatus = "active" | "scheduled" | "expired" | "revoked";

export function grantStatus(grant: HeartGrant, now: Date = new Date()): HeartGrantStatus {
  if (grant.revoked_at) return "revoked";
  const t = now.getTime();
  if (Date.parse(grant.expires_at) <= t) return "expired";
  if (Date.parse(grant.starts_at) > t) return "scheduled";
  return "active";
}

export const GRANT_STATUS_LABEL: Record<HeartGrantStatus, string> = {
  active: "actif",
  scheduled: "programmé",
  expired: "expiré",
  revoked: "révoqué",
};
