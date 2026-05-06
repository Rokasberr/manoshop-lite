# Production Backend Report

## What Was Fixed

- Added consistent API error responses with production-safe messages.
- Added auth input validation, configurable JWT expiry, stateless logout, and server-side role guards.
- Added reconciliation models for payments, subscriptions, and processed Stripe webhook events.
- Added indexes for common user, order, payment, subscription, and product lookups.
- Updated Stripe Checkout to create or reuse Stripe Customers.
- Updated subscription checkout to use configured Stripe Price IDs in production.
- Kept development fallback dynamic Stripe prices for local testing only.
- Added idempotency keys for Checkout and admin refund requests.
- Moved order, payment, and subscription state changes behind verified Stripe webhooks.
- Added Stripe webhook event de-duplication using stored Stripe event IDs.
- Added admin APIs for orders, payments, subscriptions, refunds, and subscription cancellation.
- Added security headers, request validation, object ID validation, CORS hardening through required production `CLIENT_URL`, and startup env validation.
- Added backend-focused test, lint, and typecheck scripts.

## Stripe Flow

### Product Checkout

1. Authenticated customer submits cart to `POST /api/orders/stripe/checkout-session`.
2. Backend validates items, reserves stock, creates a pending order, and creates/reuses the Stripe Customer.
3. Backend creates a Stripe Checkout Session in `payment` mode with `checkoutType=order`, `orderId`, and `userId` metadata.
4. Success page only reads the current order status. It does not mark orders as paid.
5. Verified webhook `checkout.session.completed` marks the order paid, records payment data, and triggers digital delivery when needed.
6. Verified webhook refund events reconcile refunded payment/order state.

### Subscription Checkout

1. Authenticated customer chooses a paid plan and calls `POST /api/billing/create-payment-session`.
2. Backend validates the plan, creates/reuses the Stripe Customer, and creates Checkout in `subscription` mode.
3. Production uses `STRIPE_PRICE_CIRCLE` and `STRIPE_PRICE_PRIVATE`.
4. Checkout Session and Subscription metadata include `userId` and `planId`.
5. Success/profile polling only verifies ownership and returns local DB state.
6. Verified webhooks update the embedded user subscription and the `Subscription` collection.

## Webhook Events Handled

- `checkout.session.completed`
- `checkout.session.expired`
- `invoice.paid`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `charge.refunded`
- `refund.updated`

Each Stripe event ID is stored in `WebhookEvent` to avoid duplicate processing.

## Required Environment Variables

- `PORT`
- `NODE_ENV`
- `TRUST_PROXY`
- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CLIENT_URL`
- `COMPANY_NAME`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_CIRCLE`
- `STRIPE_PRICE_PRIVATE`
- `STRIPE_WEBHOOK_TOLERANCE_SECONDS`
- `STRIPE_DYNAMIC_TAX_BEHAVIOR`
- Email/Brevo/SMTP variables from `server/.env.example` when email delivery is enabled.

Production startup requires `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_CIRCLE`, and `STRIPE_PRICE_PRIVATE`.

## Deployment Checklist

1. Create real Stripe Products and recurring Prices for `Asmeninis` and `Privatus verslas`.
2. Set `STRIPE_PRICE_CIRCLE` and `STRIPE_PRICE_PRIVATE` to the real live `price_...` IDs.
3. Set `STRIPE_SECRET_KEY` to the live secret key only on the backend host.
4. Configure Stripe webhook endpoint: `https://<api-domain>/api/billing/webhook`.
5. Subscribe webhook endpoint to all events listed above.
6. Set `STRIPE_WEBHOOK_SECRET` from Stripe webhook signing secret.
7. Set `CLIENT_URL` to the production frontend origin first.
8. Set a 32+ character `JWT_SECRET`.
9. Set `NODE_ENV=production` and `TRUST_PROXY=true` on Render or similar proxies.
10. Deploy backend, then run a Stripe test-mode checkout before switching live keys.

## Remaining Risks

- Existing frontend still displays `Bazinis` as a visible 5.99 plan but treats it as internal/free checkout. Decide whether Bazinis should become a real paid Stripe subscription.
- Existing admin UI does not yet display the new `/api/admin/payments` and `/api/admin/subscriptions` endpoints.
- Client bundle has an existing Vite chunk-size warning; build succeeds, but code splitting could improve load performance.
- Webhook delivery must be monitored in Stripe Dashboard after deployment.
- Existing historical payments/orders may need a one-time reconciliation script if they were created before the new `Payment` and `Subscription` models.

## Manual Stripe Test Checklist

1. Create a test customer account and buy a one-time product with Stripe test card `4242 4242 4242 4242`.
2. Confirm order remains pending immediately after redirect until webhook arrives.
3. Confirm webhook marks order paid and digital downloads unlock for digital products.
4. Buy `Asmeninis` subscription and confirm user subscription becomes `circle` and `active`.
5. Buy or switch to `Privatus verslas` and confirm plan becomes `private`.
6. Trigger `invoice.payment_failed` with Stripe test tools and confirm membership moves to non-active/past-due state.
7. Cancel subscription in Stripe Dashboard and confirm webhook updates local subscription.
8. Refund a product payment from admin API and confirm refund webhook updates local payment/order state.
9. Replay a webhook event from Stripe Dashboard and confirm it is treated as duplicate.
10. Confirm no `sk_` or `whsec_` values are present in client build output or frontend env.
