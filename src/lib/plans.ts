// Hardcoded pricing plans.
// The account-service exposes no public "list plans" endpoint, so tier copy and
// pricing live here as the single source of truth. `id` maps to the backend
// Stripe price/plan configuration (used as the checkout `planId`).

export interface PricingPlan {
  id: number;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
}

export const PRICING_PLANS: PricingPlan[] = [
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
    price: "₹5,499",
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
export const getPlanById = (id: number | null | undefined): PricingPlan | undefined =>
  id == null ? undefined : PRICING_PLANS.find((p) => p.id === id);
