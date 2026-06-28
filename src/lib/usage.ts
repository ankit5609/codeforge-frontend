import type { SubscriptionResponse } from "./types";

export type MeterTone = "ok" | "warning" | "critical";

export const clampPct = (n: number): number => Math.max(0, Math.min(100, Math.round(n)));

export function meterTone(pct: number): MeterTone {
  if (pct >= 90) return "critical";
  if (pct >= 75) return "warning";
  return "ok";
}

export interface DerivedUsage {
  used: number;
  limit: number;
  pct: number;
  unlimited: boolean;
}

/** AI token usage derived from the subscription (per-cycle usage vs plan allowance). */
export function deriveTokenUsage(sub: SubscriptionResponse | null): DerivedUsage {
  const used = sub?.tokensUsedThisCycle ?? 0;
  const unlimited = !!sub?.plan?.unlimitedAi;
  const limit = sub?.plan?.maxTokensPerDay ?? 0;
  const pct = unlimited || limit <= 0 ? 0 : clampPct((used / limit) * 100);
  return { used, limit, pct, unlimited };
}

/** Project usage derived from the subscription plan + the already-loaded project count. */
export function deriveProjectUsage(
  sub: SubscriptionResponse | null,
  projectCount: number,
): DerivedUsage {
  const limit = sub?.plan?.maxProjects ?? 0;
  const used = projectCount;
  const pct = limit <= 0 ? 0 : clampPct((used / limit) * 100);
  return { used, limit, pct, unlimited: false };
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}
