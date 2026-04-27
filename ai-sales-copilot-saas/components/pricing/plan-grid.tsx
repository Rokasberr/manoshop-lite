"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubscriptionPlan } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

type Plan = {
  id: SubscriptionPlan;
  name: string;
  price: number;
  description: string;
  features: string[];
};

type Props = {
  plans: Plan[];
};

export function PlanGrid({ plans }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  async function startCheckout(planId: SubscriptionPlan) {
    if (!session) {
      router.push("/sign-in?next=/pricing");
      return;
    }

    try {
      setLoadingPlan(planId);
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to create checkout session");
      }

      window.location.href = payload.url;
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to start checkout");
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-4">
      {plans.map((plan, index) => (
        <Card
          key={plan.id}
          className={index === 1 ? "border-slate-950 bg-slate-950 text-white shadow-2xl shadow-slate-900/10" : ""}
        >
          <div className="flex min-h-[380px] flex-col">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-500">{plan.name}</p>
              <CardTitle className={index === 1 ? "text-white" : ""}>{formatCurrency(plan.price)}/mo</CardTitle>
              <CardDescription className={index === 1 ? "text-slate-300" : ""}>{plan.description}</CardDescription>
            </div>

            <ul className="mt-8 space-y-3 text-sm">
              {plan.features.map((feature) => (
                <li key={feature} className={index === 1 ? "text-slate-200" : "text-slate-700"}>
                  {feature}
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-8">
              <Button
                variant={index === 1 ? "default" : "dark"}
                className={index === 1 ? "" : "w-full"}
                onClick={() => startCheckout(plan.id)}
                disabled={loadingPlan === plan.id}
              >
                {loadingPlan === plan.id ? "Redirecting..." : "Start subscription"}
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
