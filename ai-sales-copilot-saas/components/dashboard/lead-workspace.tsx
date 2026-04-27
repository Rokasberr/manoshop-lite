"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, formatDate } from "@/lib/utils";

type Lead = {
  id: string;
  name: string;
  email: string;
  company: string;
  status: string;
  score: number;
  source?: string | null;
  updatedAt: string;
  deal?: {
    value: number;
    stage: string;
    probability: number;
  } | null;
};

type Props = {
  initialLeads: Lead[];
};

export function LeadWorkspace({ initialLeads }: Props) {
  const [leads, setLeads] = useState(initialLeads);
  const [selectedLeadId, setSelectedLeadId] = useState(initialLeads[0]?.id ?? "");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    companySize: "",
    industry: "",
    website: "",
    source: "",
    notes: "",
  });
  const [draft, setDraft] = useState({ subject: "", body: "", nextAction: "" });
  const [notice, setNotice] = useState("");
  const [deal, setDeal] = useState({ value: "", stage: "QUALIFIED", expectedCloseAt: "" });
  const [loadingAi, setLoadingAi] = useState(false);
  const [sending, setSending] = useState(false);
  const [savingDeal, setSavingDeal] = useState(false);

  function getErrorMessage(payload: unknown, fallback: string) {
    if (payload && typeof payload === "object" && "error" in payload) {
      const value = (payload as { error?: unknown }).error;

      if (typeof value === "string") {
        return value;
      }

      if (value && typeof value === "object" && "formErrors" in value) {
        const formErrors = (value as { formErrors?: string[] }).formErrors;
        if (formErrors?.length) {
          return formErrors[0];
        }
      }
    }

    return fallback;
  }

  const selectedLead = useMemo(
    () => leads.find((lead) => lead.id === selectedLeadId) ?? leads[0] ?? null,
    [leads, selectedLeadId],
  );

  useEffect(() => {
    if (!selectedLead) {
      return;
    }

    setDraft({ subject: "", body: "", nextAction: "" });
    setDeal({
      value: selectedLead.deal?.value ? String(selectedLead.deal.value) : "",
      stage: selectedLead.deal?.stage ?? "QUALIFIED",
      expectedCloseAt: "",
    });
  }, [selectedLead]);

  async function createLead(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setNotice("");

    const response = await fetch("/api/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        companySize: form.companySize ? Number(form.companySize) : undefined,
      }),
    });
    const payload = await response.json();
    setCreating(false);

    if (!response.ok) {
      setNotice(getErrorMessage(payload, "Unable to create lead."));
      return;
    }

    const lead = payload.lead as Lead;
    setLeads((current) => [lead, ...current]);
    setSelectedLeadId(lead.id);
    setForm({
      name: "",
      email: "",
      company: "",
      companySize: "",
      industry: "",
      website: "",
      source: "",
      notes: "",
    });
    setNotice("Lead created.");
  }

  async function generateEmail() {
    if (!selectedLead) {
      return;
    }

    setLoadingAi(true);
    setNotice("");
    const response = await fetch("/api/ai/generate-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        leadId: selectedLead.id,
      }),
    });
    const payload = await response.json();
    setLoadingAi(false);

    if (!response.ok) {
      setNotice(getErrorMessage(payload, "Unable to generate email."));
      return;
    }

    setDraft({
      subject: payload.email.subject,
      body: payload.email.body,
      nextAction: payload.email.nextAction,
    });
  }

  async function sendEmail() {
    if (!selectedLead) {
      return;
    }

    setSending(true);
    setNotice("");
    const response = await fetch("/api/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        leadId: selectedLead.id,
        subject: draft.subject,
        content: draft.body,
        tone: "professional",
        scheduleFollowUps: true,
      }),
    });
    const payload = await response.json();
    setSending(false);

    if (!response.ok) {
      setNotice(getErrorMessage(payload, "Unable to send email."));
      return;
    }

    setNotice(payload.message?.metadata?.mock ? "Email logged locally. Add Resend key for live sending." : "Email sent.");
  }

  async function updateDeal() {
    if (!selectedLead) {
      return;
    }

    setSavingDeal(true);
    setNotice("");
    const response = await fetch("/api/deals/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        leadId: selectedLead.id,
        value: Number(deal.value),
        stage: deal.stage,
        expectedCloseAt: deal.expectedCloseAt ? new Date(deal.expectedCloseAt).toISOString() : undefined,
      }),
    });
    const payload = await response.json();
    setSavingDeal(false);

    if (!response.ok) {
      setNotice(getErrorMessage(payload, "Unable to save deal."));
      return;
    }

    setLeads((current) =>
      current.map((lead) =>
        lead.id === selectedLead.id
          ? {
              ...lead,
              deal: payload.deal,
            }
          : lead,
      ),
    );
    setNotice("Deal updated.");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-6">
        <Card className="rounded-[32px] p-6">
          <div className="space-y-2">
            <CardTitle>Add lead</CardTitle>
            <CardDescription>Create a lead and let the system score and route it.</CardDescription>
          </div>
          <form className="mt-6 space-y-3" onSubmit={createLead}>
            <Input placeholder="Lead name" value={form.name} onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))} required />
            <Input placeholder="Lead email" type="email" value={form.email} onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))} required />
            <Input placeholder="Company" value={form.company} onChange={(e) => setForm((c) => ({ ...c, company: e.target.value }))} required />
            <Input placeholder="Company size" value={form.companySize} onChange={(e) => setForm((c) => ({ ...c, companySize: e.target.value }))} />
            <Input placeholder="Industry" value={form.industry} onChange={(e) => setForm((c) => ({ ...c, industry: e.target.value }))} />
            <Input placeholder="Website" value={form.website} onChange={(e) => setForm((c) => ({ ...c, website: e.target.value }))} />
            <Input placeholder="Source" value={form.source} onChange={(e) => setForm((c) => ({ ...c, source: e.target.value }))} />
            <Textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm((c) => ({ ...c, notes: e.target.value }))} />
            <Button className="w-full" type="submit" variant="dark" disabled={creating}>
              {creating ? "Creating..." : "Create lead"}
            </Button>
          </form>
        </Card>

        <Card className="rounded-[32px] p-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lead list</CardTitle>
              <CardDescription>Pick a lead to generate an email or update the deal.</CardDescription>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {leads.length === 0 ? (
              <p className="text-sm text-slate-500">No leads yet. Create your first one to start the AI flow.</p>
            ) : (
              leads.map((lead) => (
                <button
                  key={lead.id}
                  className={`w-full rounded-3xl border p-4 text-left transition ${
                    selectedLeadId === lead.id ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white"
                  }`}
                  onClick={() => setSelectedLeadId(lead.id)}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{lead.name}</p>
                      <p className={selectedLeadId === lead.id ? "text-slate-300" : "text-slate-500"}>
                        {lead.company} • {lead.status}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p>{lead.score}/100</p>
                      <p className={selectedLeadId === lead.id ? "text-slate-300" : "text-slate-500"}>{formatDate(lead.updatedAt)}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="rounded-[32px] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle>{selectedLead ? `${selectedLead.company} workspace` : "Lead workspace"}</CardTitle>
              <CardDescription>
                {selectedLead
                  ? `${selectedLead.name} • ${selectedLead.email} • score ${selectedLead.score}/100`
                  : "Select a lead to open the AI workspace."}
              </CardDescription>
            </div>
            <Button variant="dark" onClick={generateEmail} disabled={!selectedLead || loadingAi}>
              {loadingAi ? "Generating..." : "Generate AI email"}
            </Button>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Generated subject</p>
              <Input value={draft.subject} onChange={(e) => setDraft((c) => ({ ...c, subject: e.target.value }))} placeholder="AI subject line will appear here" />
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Email body</p>
              <Textarea value={draft.body} onChange={(e) => setDraft((c) => ({ ...c, body: e.target.value }))} placeholder="AI email body" className="min-h-56" />
              <Button variant="dark" className="w-full" onClick={sendEmail} disabled={!selectedLead || !draft.subject || !draft.body || sending}>
                {sending ? "Sending..." : "Send and start follow-ups"}
              </Button>
            </div>

            <div className="space-y-5">
              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Suggested next action</p>
                <p className="mt-3 text-sm leading-7 text-slate-700">{draft.nextAction || "Generate an AI email to receive strategy guidance."}</p>
              </div>

              <div className="rounded-[28px] border border-slate-200 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Deal update</p>
                <div className="mt-4 space-y-3">
                  <Input placeholder="Deal value (EUR)" value={deal.value} onChange={(e) => setDeal((c) => ({ ...c, value: e.target.value }))} />
                  <select
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm"
                    value={deal.stage}
                    onChange={(e) => setDeal((c) => ({ ...c, stage: e.target.value }))}
                  >
                    <option value="QUALIFIED">Qualified</option>
                    <option value="PROPOSAL">Proposal</option>
                    <option value="NEGOTIATION">Negotiation</option>
                    <option value="WON">Won</option>
                    <option value="LOST">Lost</option>
                  </select>
                  <Input type="date" value={deal.expectedCloseAt} onChange={(e) => setDeal((c) => ({ ...c, expectedCloseAt: e.target.value }))} />
                  <Button variant="secondary" className="w-full" onClick={updateDeal} disabled={!selectedLead || !deal.value || savingDeal}>
                    {savingDeal ? "Saving..." : "Update deal"}
                  </Button>
                </div>
              </div>

              {selectedLead?.deal ? (
                <div className="rounded-[28px] border border-cyan-200 bg-cyan-50 p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-800">Current deal</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">{formatCurrency(selectedLead.deal.value)}</p>
                  <p className="mt-2 text-sm text-slate-700">
                    {selectedLead.deal.stage} • {selectedLead.deal.probability}% probability
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          {notice ? <p className="mt-5 text-sm text-slate-600">{notice}</p> : null}
        </Card>
      </div>
    </div>
  );
}
