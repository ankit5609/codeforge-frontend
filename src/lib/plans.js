// Hardcoded pricing plans.
// The account-service exposes no public "list plans" endpoint, so tier copy and
// pricing live here as the single source of truth. `id` maps to the backend
// Stripe price/plan configuration (used as the checkout `planId`).
export const PRICING_PLANS = [
    {
        id: 1,
        name: "Pro Plan",
        price: "₹1499",
        period: "month",
        description: "Perfect for developers and small side projects.",
        features: [
            "Up to 3 active projects",
            "Up to 3 active project previews",
            "10,000 AI tokens per day",
            "Standard LLM intelligence capabilities",
            "Email support",
        ],
        isPopular: true,
    },
    {
        id: 2,
        name: "Business Plan",
        price: "₹4,999",
        period: "month",
        description: "Designed for power users and growing developers.",
        features: [
            "Up to 10 active projects",
            "Up to 10 active project previews",
            "50,000 AI tokens per day",
            "Unlimited AI assistance & generations",
            "Priority infrastructure and faster builds",
            "Priority customer support",
        ],
        isPopular: false,
    },
];
// Look up a plan by its backend id.
export const getPlanById = (id) => id == null ? undefined : PRICING_PLANS.find((p) => p.id === id);
/**
 * Derive everything the UI needs to show about a subscription, straight from the
 * backend response — no hard-coded plan assumptions (e.g. the demo user is not
 * shown as "Pro").
 */
export function describeSubscription(sub) {
    if (!sub) {
        return { name: "Free plan", statusLabel: "No plan", tone: "muted", price: null, isDemo: false, isActive: false };
    }
    const backendName = sub.plan?.name?.trim();
    const backendPrice = sub.plan?.price?.trim() || null;
    switch (sub.status) {
        case "DEMO_LOCKED":
            return { name: "Demo workspace", statusLabel: "Demo locked", tone: "amber", price: null, isDemo: true, isActive: false };
        case "ACTIVE":
        case "TRIALING":
            return {
                name: backendName || "Active plan",
                statusLabel: sub.status === "TRIALING" ? "Trialing" : "Active",
                tone: "primary",
                price: backendPrice,
                isDemo: false,
                isActive: true,
            };
        case "PAST_DUE":
            return { name: backendName || "Active plan", statusLabel: "Past due", tone: "amber", price: backendPrice, isDemo: false, isActive: true };
        case "INCOMPLETE":
            return { name: backendName || "Free plan", statusLabel: "Incomplete", tone: "amber", price: backendPrice, isDemo: false, isActive: false };
        case "NONE":
        default:
            return { name: backendName || "Free plan", statusLabel: "No active plan", tone: "muted", price: backendPrice, isDemo: false, isActive: false };
    }
}
