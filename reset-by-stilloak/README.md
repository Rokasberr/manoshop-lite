# RESET by Stilloak

Mobile-first 7/30/60/90 day routine and behaviour tracking product for `reset.stilloak-studio.com`.

## Architecture

- React + Vite + TypeScript client
- Node + Express Vercel Function API
- MongoDB Atlas through Mongoose
- Signed JWT in an HttpOnly, Secure, SameSite cookie
- Stripe Checkout for the €19 one-time Founding Lifetime purchase
- Brevo transactional email API with SMTP fallback
- Vercel Cron for due morning, evening, and weekly emails

RESET is isolated in this directory so the existing Stilloak membership and Web products are not coupled to its release cycle. It reuses their proven security patterns and email infrastructure conventions.

## Local setup

1. Copy `.env.example` to `.env.local` and add development-only values.
2. Run `npm ci`.
3. Run `npm run dev`.
4. Open `http://localhost:5173`.

The API runs at `http://localhost:4000` and Vite proxies `/api` to it.

## Checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Vercel project

- Git repository: `Rokasberr/manoshop-lite`
- Root Directory: `reset-by-stilloak`
- Framework: Vite
- Production branch: `main`
- Intended domain: `reset.stilloak-studio.com`

Use separate preview and production environment values. Keep Stripe in a sandbox/test environment until preview verification is complete. Never commit `.env` values.

## Release gates

1. Local lint, typecheck, tests, and build are green.
2. Preview signup → onboarding → Today → check-in flow passes on mobile and desktop.
3. Forgot-password email and cron email rendering are verified.
4. Stripe sandbox Checkout and signed webhook are verified; access is not granted by the redirect page.
5. Admin data and podcast management are protected by the server-side admin guard.
6. Only then can the same verified artifact be promoted to production and assigned to the domain.
