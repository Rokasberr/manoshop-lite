# AI Sales Copilot SaaS MVP

## Architecture Overview

This project lives in [ai-sales-copilot-saas/package.json](/C:/Users/User/Documents/New%20project/ai-sales-copilot-saas/package.json) as a separate Next.js App Router app so it does not overwrite the older MERN e-commerce project in the workspace.

- Frontend: Next.js App Router, Tailwind CSS, shadcn-style UI primitives in [ai-sales-copilot-saas/components/ui](/C:/Users/User/Documents/New%20project/ai-sales-copilot-saas/components/ui)
- Backend: Next.js route handlers in [ai-sales-copilot-saas/app/api](/C:/Users/User/Documents/New%20project/ai-sales-copilot-saas/app/api)
- Database: PostgreSQL with Prisma schema in [ai-sales-copilot-saas/prisma/schema.prisma](/C:/Users/User/Documents/New%20project/ai-sales-copilot-saas/prisma/schema.prisma)
- Auth: NextAuth with Google and email/password in [ai-sales-copilot-saas/lib/auth.ts](/C:/Users/User/Documents/New%20project/ai-sales-copilot-saas/lib/auth.ts)
- AI: OpenAI email generation and lead scoring helpers in [ai-sales-copilot-saas/lib/ai.ts](/C:/Users/User/Documents/New%20project/ai-sales-copilot-saas/lib/ai.ts)
- Email: Resend integration in [ai-sales-copilot-saas/lib/email.ts](/C:/Users/User/Documents/New%20project/ai-sales-copilot-saas/lib/email.ts)
- Billing: Stripe checkout, portal, and webhook handlers in [ai-sales-copilot-saas/app/api/stripe](/C:/Users/User/Documents/New%20project/ai-sales-copilot-saas/app/api/stripe)

## Database Schema

The Prisma schema includes the mandatory business models plus a lightweight activity timeline:

- `User`: email, password hash, role, current plan, Stripe customer id
- `Lead`: name, email, company, status, score, follow-up dates, engagement metadata
- `Deal`: lead relation, value, stage, probability, AI insight
- `Message`: sent emails, AI drafts, follow-ups, reply status, provider id
- `Subscription`: plan, status, Stripe ids, lead limit, billing period
- `LeadActivity`: timeline log for creation, status updates, replies, and automation events

## Backend API

Implemented route handlers:

- `POST /api/register`
- `POST /api/leads`
- `GET /api/leads`
- `POST /api/deals/update`
- `POST /api/ai/generate-email`
- `POST /api/email/send`
- `POST /api/email/webhook`
- `POST /api/stripe/create-checkout-session`
- `POST /api/stripe/portal`
- `POST /api/stripe/webhook`
- `GET /api/dashboard`
- `GET /api/follow-ups/run`

Validation uses Zod schemas from [ai-sales-copilot-saas/lib/schemas.ts](/C:/Users/User/Documents/New%20project/ai-sales-copilot-saas/lib/schemas.ts). Protected routes use the session helpers in [ai-sales-copilot-saas/lib/session.ts](/C:/Users/User/Documents/New%20project/ai-sales-copilot-saas/lib/session.ts). AI email generation is rate-limited with a lightweight in-memory limiter in [ai-sales-copilot-saas/lib/rate-limit.ts](/C:/Users/User/Documents/New%20project/ai-sales-copilot-saas/lib/rate-limit.ts).

## AI Logic Implementation

The MVP keeps AI logic practical and deployable:

- Lead scoring is heuristic and deterministic so it works even before OpenAI credits are configured.
- Email generation calls the OpenAI Responses API when `OPENAI_API_KEY` exists, otherwise it falls back to a local sales template.
- Follow-up strategy escalates tone from `soft` to `urgency` to `final reminder`.
- Automation stops once a reply webhook marks the lead as replied.

Core files:

- [ai-sales-copilot-saas/lib/ai.ts](/C:/Users/User/Documents/New%20project/ai-sales-copilot-saas/lib/ai.ts)
- [ai-sales-copilot-saas/lib/follow-up.ts](/C:/Users/User/Documents/New%20project/ai-sales-copilot-saas/lib/follow-up.ts)

## Frontend Dashboard

Main screens:

- Landing page: [ai-sales-copilot-saas/app/page.tsx](/C:/Users/User/Documents/New%20project/ai-sales-copilot-saas/app/page.tsx)
- Pricing: [ai-sales-copilot-saas/app/pricing/page.tsx](/C:/Users/User/Documents/New%20project/ai-sales-copilot-saas/app/pricing/page.tsx)
- Sign in and register: [ai-sales-copilot-saas/app/sign-in/page.tsx](/C:/Users/User/Documents/New%20project/ai-sales-copilot-saas/app/sign-in/page.tsx), [ai-sales-copilot-saas/app/register/page.tsx](/C:/Users/User/Documents/New%20project/ai-sales-copilot-saas/app/register/page.tsx)
- Dashboard overview: [ai-sales-copilot-saas/app/dashboard/page.tsx](/C:/Users/User/Documents/New%20project/ai-sales-copilot-saas/app/dashboard/page.tsx)
- Lead workspace: [ai-sales-copilot-saas/app/dashboard/leads/page.tsx](/C:/Users/User/Documents/New%20project/ai-sales-copilot-saas/app/dashboard/leads/page.tsx)
- Billing settings: [ai-sales-copilot-saas/app/dashboard/settings/page.tsx](/C:/Users/User/Documents/New%20project/ai-sales-copilot-saas/app/dashboard/settings/page.tsx)

The lead workspace already supports:

- creating leads
- generating AI emails
- sending outbound emails
- starting follow-up automation
- updating deal value and stage

## Stripe Integration

Subscription plans live in [ai-sales-copilot-saas/lib/subscription-plans.ts](/C:/Users/User/Documents/New%20project/ai-sales-copilot-saas/lib/subscription-plans.ts).

The Stripe flow is:

1. user signs in
2. user chooses a plan on `/pricing`
3. frontend calls `POST /api/stripe/create-checkout-session`
4. Stripe Checkout handles payment
5. Stripe webhook updates `Subscription` and `User.currentPlan`
6. success and cancel pages communicate the result

## Email System

Outbound email delivery is wired for Resend:

- live send when `RESEND_API_KEY` is present
- local mock logging when the key is missing
- sent message history stored in `Message`
- reply webhooks can pause automation

Files:

- [ai-sales-copilot-saas/lib/email.ts](/C:/Users/User/Documents/New%20project/ai-sales-copilot-saas/lib/email.ts)
- [ai-sales-copilot-saas/app/api/email/send/route.ts](/C:/Users/User/Documents/New%20project/ai-sales-copilot-saas/app/api/email/send/route.ts)
- [ai-sales-copilot-saas/app/api/email/webhook/route.ts](/C:/Users/User/Documents/New%20project/ai-sales-copilot-saas/app/api/email/webhook/route.ts)

## Deployment Guide

### Local setup

```bash
cd ai-sales-copilot-saas
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npm run dev
```

PowerShell helper:

```powershell
Set-Location "C:\Users\User\Documents\New project\ai-sales-copilot-saas"
Copy-Item .env.example .env
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Optional demo data:

```bash
npm run db:seed
```

Demo login from the seed:

- email: `founder@aisalescopilot.dev`
- password: `Demo12345!`

### Environment variables

Required for production:

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `OPENAI_API_KEY`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_STARTER_PRICE_ID`
- `STRIPE_GROWTH_PRICE_ID`
- `STRIPE_AGENCY_PRICE_ID`
- `STRIPE_ENTERPRISE_PRICE_ID`
- `APP_URL`
- `CRON_SECRET`

### Vercel

- Deploy the `ai-sales-copilot-saas` directory as its own project.
- Add the environment variables from `.env.example`.
- Point the Vercel cron to `/api/follow-ups/run`.
- Add Stripe webhook endpoint: `https://your-domain.com/api/stripe/webhook`
- Add Resend webhook endpoint: `https://your-domain.com/api/email/webhook`

### Docker

Docker support is included through [ai-sales-copilot-saas/Dockerfile](/C:/Users/User/Documents/New%20project/ai-sales-copilot-saas/Dockerfile). Build with:

```bash
docker build -t ai-sales-copilot-saas .
docker run -p 3000:3000 --env-file .env ai-sales-copilot-saas
```
