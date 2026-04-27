const steps = [
  "Rep or founder adds a lead and initial deal context.",
  "AI scores the lead, drafts a personalized email, and recommends the next action.",
  "Outbound is sent through Resend and logged to the CRM timeline.",
  "If there is no reply, follow-up automation escalates the tone after 1, 3, and 7 days.",
  "Dashboard shows pipeline health, revenue forecast, and at-risk opportunities.",
];

export function WorkflowSection() {
  return (
    <section id="workflow" className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-700">Workflow</p>
            <h2 className="mt-4 font-heading text-4xl text-slate-950">From new lead to intelligent follow-up in one flow.</h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              This MVP is shaped for high-ticket B2B sales teams that care about speed, signal quality, and next-step
              clarity more than bloated enterprise software.
            </p>
          </div>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={step} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">Step {index + 1}</p>
                <p className="mt-2 text-base leading-7 text-slate-700">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
