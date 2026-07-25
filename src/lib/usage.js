export const clampPct = (n) => Math.max(0, Math.min(100, Math.round(n)));
export function meterTone(pct) {
    if (pct >= 90)
        return "critical";
    if (pct >= 75)
        return "warning";
    return "ok";
}
/** AI token usage derived from the subscription (per-cycle usage vs plan allowance). */
export function deriveTokenUsage(sub) {
    const used = sub?.tokensUsedThisCycle ?? 0;
    const unlimited = !!sub?.plan?.unlimitedAi;
    const limit = sub?.plan?.maxTokensPerDay ?? 0;
    const pct = unlimited || limit <= 0 ? 0 : clampPct((used / limit) * 100);
    return { used, limit, pct, unlimited };
}
/** Project usage derived from the subscription plan + the already-loaded project count. */
export function deriveProjectUsage(sub, projectCount) {
    const limit = sub?.plan?.maxProjects ?? 0;
    const used = projectCount;
    const pct = limit <= 0 ? 0 : clampPct((used / limit) * 100);
    return { used, limit, pct, unlimited: false };
}
export function formatNumber(n) {
    return new Intl.NumberFormat("en-US").format(n);
}
