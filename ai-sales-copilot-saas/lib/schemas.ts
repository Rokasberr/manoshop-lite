import { DealStage, LeadStatus, SubscriptionPlan } from "@prisma/client";
import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const leadSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  company: z.string().min(2).max(80),
  companySize: z.coerce.number().int().min(1).max(100000).optional(),
  industry: z.string().max(80).optional(),
  website: z.string().url().optional().or(z.literal("")),
  source: z.string().max(120).optional(),
  notes: z.string().max(500).optional(),
  status: z.nativeEnum(LeadStatus).optional(),
});

export const dealUpdateSchema = z.object({
  leadId: z.string().min(1),
  value: z.coerce.number().int().min(0),
  stage: z.nativeEnum(DealStage),
  expectedCloseAt: z.string().datetime().optional().or(z.literal("")),
});

export const aiEmailSchema = z.object({
  leadId: z.string().min(1),
  objective: z.string().max(240).optional(),
});

export const sendEmailSchema = z.object({
  leadId: z.string().min(1),
  subject: z.string().min(3).max(160),
  content: z.string().min(20).max(5000),
  tone: z.string().max(40).optional(),
  isAutomated: z.boolean().optional(),
  scheduleFollowUps: z.boolean().optional(),
});

export const checkoutSchema = z.object({
  planId: z.nativeEnum(SubscriptionPlan),
});
