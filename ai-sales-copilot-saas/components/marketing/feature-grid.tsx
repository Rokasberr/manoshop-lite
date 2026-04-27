import { Card, CardDescription, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "AI follow-up engine",
    text: "Queue 1, 3, and 7 day follow-ups that escalate tone automatically and stop when a lead replies.",
  },
  {
    title: "CRM light for B2B teams",
    text: "Track leads, stages, value, notes, and message history without dragging in a heavyweight CRM stack.",
  },
  {
    title: "Deal scoring and insights",
    text: "Surface at-risk revenue, predicted close probability, and the next best action for every active opportunity.",
  },
  {
    title: "Built-in monetization",
    text: "Stripe subscriptions, webhook syncing, usage limits, and billing management are already wired into the MVP.",
  },
];

export function FeatureGrid() {
  return (
    <section id="features" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-700">Core functionality</p>
          <h2 className="mt-4 font-heading text-4xl text-slate-950">Everything needed to sell a serious SaaS MVP.</h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            The app ships with real auth, database schema, AI email generation, billing, and a dashboard your first
            pilot customer can actually use.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {features.map((feature) => (
            <Card key={feature.title} className="rounded-[32px] p-8">
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription className="mt-3 text-base">{feature.text}</CardDescription>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
