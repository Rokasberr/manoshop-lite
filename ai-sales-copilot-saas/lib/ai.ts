import { DealStage, Lead, LeadStatus, Message } from "@prisma/client";
import OpenAI from "openai";
import { clamp } from "@/lib/utils";

export type LeadContext = Lead & {
  deal: {
    value: number;
    stage: DealStage;
    probability: number;
    aiInsight: string | null;
  } | null;
  messages: Pick<Message, "content" | "createdAt" | "type" | "subject">[];
};

export function scoreLead(input: {
  companySize?: number | null;
  engagementScore?: number | null;
  status?: LeadStatus;
  repliedAt?: Date | null;
  source?: string | null;
}) {
  let score = 25;

  if (input.companySize) {
    if (input.companySize >= 200) {
      score += 22;
    } else if (input.companySize >= 50) {
      score += 14;
    } else {
      score += 8;
    }
  }

  score += Math.round((input.engagementScore ?? 0) * 0.28);

  if (input.source?.toLowerCase().includes("demo")) {
    score += 14;
  }

  if (input.repliedAt) {
    score += 18;
  }

  switch (input.status) {
    case LeadStatus.CONTACTED:
      score += 8;
      break;
    case LeadStatus.HOT:
      score += 18;
      break;
    case LeadStatus.CLOSED:
      score = 100;
      break;
    case LeadStatus.LOST:
      score = 10;
      break;
    default:
      break;
  }

  return clamp(score, 0, 100);
}

export function calculateDealProbability(score: number, stage: DealStage) {
  const stageBase: Record<DealStage, number> = {
    QUALIFIED: 32,
    PROPOSAL: 52,
    NEGOTIATION: 72,
    WON: 100,
    LOST: 0,
  };

  if (stage === DealStage.WON || stage === DealStage.LOST) {
    return stageBase[stage];
  }

  return clamp(Math.round(stageBase[stage] + score * 0.22), 0, 99);
}

export function buildFollowUpStrategy(lead: LeadContext) {
  const lastMessage = lead.messages[0];

  if (!lastMessage) {
    return "Send a concise intro that references the prospect's company context and asks for a 15-minute discovery call.";
  }

  if (lead.repliedAt) {
    return "Pause automation and respond manually with a tailored next-step proposal.";
  }

  if (lead.followUpStep >= 2) {
    return "Use a final reminder with urgency, surface a business outcome, and propose two specific meeting windows.";
  }

  if (lead.status === LeadStatus.HOT || (lead.deal?.probability ?? 0) >= 70) {
    return "Lead is warm. Push for a direct CTA and summarize expected ROI in one paragraph.";
  }

  return "Send a soft follow-up that adds one concrete insight and asks a single easy-to-answer question.";
}

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

function buildPrompt(lead: LeadContext, objective?: string) {
  const history = lead.messages
    .slice(0, 6)
    .map((message) => `- ${message.type}${message.subject ? ` (${message.subject})` : ""}: ${message.content}`)
    .join("\n");

  return [
    "You are an elite B2B sales copilot.",
    "Write a professional outbound or follow-up email in 120-180 words.",
    "Keep the tone sharp, clear, and revenue-focused.",
    "Include a single CTA for a reply or meeting.",
    "Use company-specific context where possible.",
    "Return JSON only with keys: subject, body, nextAction.",
    `Objective: ${objective ?? "Book the next meeting."}`,
    `Lead: ${lead.name}, ${lead.company}, status ${lead.status}, score ${lead.score}`,
    `Industry: ${lead.industry ?? "unknown"}, company size: ${lead.companySize ?? "unknown"}`,
    `Current deal: ${lead.deal ? `${lead.deal.stage} stage, value ${lead.deal.value} EUR, probability ${lead.deal.probability}%` : "no deal created"}`,
    `CRM history:\n${history || "- No prior history."}`,
  ].join("\n");
}

function parseJsonBlock(text: string) {
  const trimmed = text.trim();
  const withoutFence = trimmed.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  try {
    return JSON.parse(withoutFence) as {
      subject: string;
      body: string;
      nextAction: string;
    };
  } catch {
    return {
      subject: "Follow-up on your revenue workflow",
      body: trimmed,
      nextAction: "Review the email, tighten the CTA, and send the next touchpoint manually.",
    };
  }
}

export async function generateSalesEmail(lead: LeadContext, objective?: string) {
  const client = getOpenAIClient();
  const strategy = buildFollowUpStrategy(lead);

  if (!client) {
    return {
      subject: `${lead.company}: quick idea for your pipeline`,
      body: `Hi ${lead.name},\n\nI took a look at ${lead.company} and noticed there is a real opportunity to tighten your lead follow-up motion. Teams at your stage usually lose deals because follow-up is inconsistent, not because intent is missing.\n\nWe built AI Sales Copilot to score incoming leads, draft personalized replies, and surface the next best action automatically. If useful, I can show you what a 15-minute workflow would look like for your team.\n\nWould Tuesday or Wednesday work for a quick walkthrough?\n`,
      nextAction: strategy,
      provider: "template",
    };
  }

  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4o",
    input: buildPrompt(lead, objective),
  });

  const output =
    response.output_text ||
    '{"subject":"Pipeline follow-up idea","body":"Hi there, I wanted to follow up...","nextAction":"Invite the lead to a short discovery call."}';

  const parsed = parseJsonBlock(output);

  return {
    ...parsed,
    provider: "openai",
  };
}

export function buildDashboardInsight(args: {
  leadName: string;
  company: string;
  score: number;
  probability: number;
  daysSinceContact?: number | null;
}) {
  if ((args.daysSinceContact ?? 0) >= 7 && args.probability >= 50) {
    return `${args.company} is at risk because the deal is warm but stale. Send an urgency-based follow-up today.`;
  }

  if (args.score >= 80) {
    return `${args.leadName} is highly engaged. Prioritize a direct booking CTA in the next touchpoint.`;
  }

  return `${args.company} needs more signal. Send value-led outreach before pushing for a close.`;
}
