import { FolderGit2, Sparkles, CreditCard, Users, Infinity as InfinityIcon } from "lucide-react";
import { StatCard, type StatTone } from "./StatCard";
import type { DerivedUsage } from "@/lib/usage";
import type { SubscriptionDisplay } from "@/lib/plans";
import { formatNumber } from "@/lib/usage";

export interface QuickStatsRowProps {
  tokenUsage: DerivedUsage;
  projectUsage: DerivedUsage;
  planDisplay: SubscriptionDisplay;
  ownedCount: number;
  sharedCount: number;
  onPlanAction?: () => void;
  planActionLabel?: string;
}

const PLAN_TONE: Record<SubscriptionDisplay["tone"], StatTone> = {
  primary: "ember",
  amber: "brass",
  muted: "neutral",
};

/**
 * Four real metrics, no invented data:
 *  - Projects & AI usage come straight from deriveProjectUsage / deriveTokenUsage
 *    (unchanged calculation, only the card is new).
 *  - Current Plan comes from describeSubscription (unchanged).
 *  - Collaboration is a client-side aggregate of the already-fetched projects
 *    array's `role` field — no new API call, no new state.
 * "Deployments / Storage / Messages generated" from the brief aren't tracked
 * anywhere in the current API, so they're intentionally left out rather than
 * shown with made-up numbers.
 */
export function QuickStatsRow({
  tokenUsage,
  projectUsage,
  planDisplay,
  ownedCount,
  sharedCount,
  onPlanAction,
  planActionLabel,
}: QuickStatsRowProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={FolderGit2}
        label="Projects"
        numericValue={projectUsage.used}
        meta={projectUsage.limit > 0 ? `/ ${projectUsage.limit}` : undefined}
        progressPct={projectUsage.limit > 0 ? projectUsage.pct : undefined}
        caption="Active projects in your workspace."
        tone="ember"
      />

      <StatCard
        icon={Sparkles}
        label="AI usage"
        numericValue={tokenUsage.unlimited ? undefined : tokenUsage.used}
        formatter={(n) => formatNumber(n)}
        meta={tokenUsage.unlimited ? undefined : `/ ${formatNumber(tokenUsage.limit)}`}
        badge={
          tokenUsage.unlimited ? (
            <span className="inline-flex items-center gap-1.5 text-[15px] font-semibold" style={{ color: "var(--lp-teal)" }}>
              <InfinityIcon className="w-4 h-4" /> Unlimited
            </span>
          ) : undefined
        }
        progressPct={tokenUsage.unlimited ? undefined : tokenUsage.pct}
        caption="Resets at the start of each billing cycle."
        tone="brass"
      />

      <StatCard
        icon={CreditCard}
        label="Current plan"
        value={planDisplay.name}
        meta={planDisplay.statusLabel}
        caption={planDisplay.price ? `${planDisplay.price} / month` : "Upgrade to unlock more."}
        tone={PLAN_TONE[planDisplay.tone]}
        action={
          onPlanAction && (
            <button
              onClick={onPlanAction}
              className="text-[11.5px] font-semibold font-mono px-2 py-1 rounded-md transition-colors"
              style={{ color: "var(--lp-ink-faint)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--lp-brass)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--lp-ink-faint)")}
            >
              {planActionLabel ?? "Manage"}
            </button>
          )
        }
      />

      <StatCard
        icon={Users}
        label="Collaboration"
        value={sharedCount === 0 ? "Solo" : `${ownedCount} + ${sharedCount}`}
        meta={sharedCount === 0 ? "workspace" : "owned / shared"}
        caption={sharedCount === 0 ? "Nothing shared with you yet." : `${sharedCount} project${sharedCount === 1 ? "" : "s"} shared with you.`}
        tone="teal"
      />
    </div>
  );
}
