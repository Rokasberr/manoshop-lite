import { SubscriptionPlan } from "@prisma/client";

export type PlanDefinition = {
  id: SubscriptionPlan;
  name: string;
  price: number;
  leadLimit: number;
  description: string;
  stripePriceEnv: string | null;
  isVisible: boolean;
  features: string[];
};

export const subscriptionPlans: PlanDefinition[] = [
  {
    id: SubscriptionPlan.FREE_TRIAL,
    name: "Free trial",
    price: 0,
    leadLimit: 25,
    description: "Internal fallback plan for onboarding and demos.",
    stripePriceEnv: null,
    isVisible: false,
    features: ["25 leads", "1 user", "Manual AI email generation"],
  },
  {
    id: SubscriptionPlan.STARTER,
    name: "Starter",
    price: 99,
    leadLimit: 300,
    description: "For founders and lean outbound teams.",
    stripePriceEnv: "STRIPE_STARTER_PRICE_ID",
    isVisible: true,
    features: ["300 active leads", "AI follow-up drafts", "Core CRM dashboard"],
  },
  {
    id: SubscriptionPlan.GROWTH,
    name: "Growth",
    price: 299,
    leadLimit: 3000,
    description: "For growing teams that need real pipeline leverage.",
    stripePriceEnv: "STRIPE_GROWTH_PRICE_ID",
    isVisible: true,
    features: ["3,000 active leads", "Automation engine", "Deal intelligence"],
  },
  {
    id: SubscriptionPlan.AGENCY,
    name: "Agency",
    price: 799,
    leadLimit: 10000,
    description: "For agencies or multi-pod GTM operators.",
    stripePriceEnv: "STRIPE_AGENCY_PRICE_ID",
    isVisible: true,
    features: ["10,000 active leads", "Multi-client workflows", "Priority support"],
  },
  {
    id: SubscriptionPlan.ENTERPRISE,
    name: "Enterprise",
    price: 1500,
    leadLimit: 50000,
    description: "For custom orchestration and larger revenue teams.",
    stripePriceEnv: "STRIPE_ENTERPRISE_PRICE_ID",
    isVisible: true,
    features: ["Custom limit", "Custom AI workflows", "Dedicated onboarding"],
  },
];

export function getPlanById(id: SubscriptionPlan | string) {
  return subscriptionPlans.find((plan) => plan.id === id);
}

export function getVisiblePlans() {
  return subscriptionPlans.filter((plan) => plan.isVisible);
}

export function getStripePriceId(plan: PlanDefinition) {
  if (!plan.stripePriceEnv) {
    return null;
  }

  return process.env[plan.stripePriceEnv] ?? null;
}
