# Stilloak Studio release checklist

## Local release-candidate run

1. Install dependencies:

```bash
npm install
```

Use Node.js `>=22.12.0` for local RC validation, because the current Vite toolchain requires a modern Node runtime.

2. Create local environment files from examples:

```text
server/.env.example -> server/.env
client/.env.example -> client/.env
```

Do not commit real secrets. Demo plan does not require a Stripe Price ID. Paid plans require backend Stripe Price IDs for `STRIPE_PRICE_ASMENINIS` and `STRIPE_PRICE_PRIVATUS_VERSLAS`.

3. Optional local seed:

```bash
npm run seed
```

4. Run the application locally:

```bash
npm run dev
```

5. Validate the release candidate:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm audit --audit-level=high
```

6. Optional static preview smoke:

```bash
npm --workspace client run preview -- --host 127.0.0.1 --port 4174
```

Open `http://127.0.0.1:4174/pricing` and confirm the React root renders.

## Membership and price gates

- Demo / `basic`: 0 EUR, internal activation, no Stripe Checkout subscription.
- Asmeninis / `personal`: 24 EUR per month, Stripe subscription.
- Privatus verslas / `private_business`: 99 EUR per month, Stripe subscription.
- Demo users must not access full Saving Studio or Business Studio APIs.
- Asmeninis users must access full Saving Studio but not Business Studio.
- Privatus verslas users must access Business Studio.
- Inactive, canceled, or past-due paid memberships must not access protected paid resources.

## Critical local flows to smoke

- Register or sign in.
- Activate Demo plan and confirm member area preview access.
- Start Asmeninis checkout in Stripe test mode only, then verify paid membership sync in local/test environment.
- Open Saving Studio, complete onboarding, create/edit/delete entries, goals, recurring expenses, and CSV import.
- Sign in as Privatus verslas in local/test data, open Business Dashboard, Site Builder, Orders, Products, and public store preview.
- Confirm pending store checkout orders are visible for audit but not included in paid revenue totals.
- Download an invoice for a paid order.
- Sign in as admin in a safe local/test environment and confirm admin analytics routes require admin role.

## Manual production launch checklist

- Owner approves production launch window and rollback plan.
- Owner verifies production domain, DNS, TLS, and SPA fallback.
- Owner verifies `CLIENT_URL` and CORS allow only intended production origins.
- Owner verifies production MongoDB connection points to the approved production database.
- Owner verifies admin account creation or rotation through a private channel; no public/default admin password is used.
- Owner verifies Stripe Live mode is intentionally enabled only after final approval.
- Owner verifies `STRIPE_PRICE_ASMENINIS` is 24 EUR per month.
- Owner verifies `STRIPE_PRICE_PRIVATUS_VERSLAS` is 99 EUR per month.
- Owner configures Stripe webhook `/api/billing/webhook` and validates signing secret.
- Owner performs one real low-risk payment path only after Stripe Live approval.
- Owner verifies email provider credentials and sender identity.
- Owner verifies backup and restore process for production database.
- Owner monitors first production logs for auth, billing webhook, checkout, and order errors.

## Known residual risks

- React Router has two moderate audit findings. The automated fix requires a major `react-router-dom@7` migration and is left as an owner-approved follow-up, because high/critical audit criteria are clean.
- Local Chrome and Edge headless screenshot smoke failed in this environment because the Chromium GPU process did not start. Responsive and accessibility regressions are covered by static tests, but visual browser QA should be repeated manually or in CI with a working browser runtime.
- Authenticated browser smoke was not run with real credentials. Auth, access control, billing sync, and route guards are covered by automated backend/static tests.
