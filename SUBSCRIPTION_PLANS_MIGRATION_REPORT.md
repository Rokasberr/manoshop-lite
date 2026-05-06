# Subscription Plans Migration Report

## Files Changed

- `server/config/env.js`
- `server/config/subscriptionPlans.js`
- `server/controllers/billingController.js`
- `server/middleware/requestValidation.js`
- `server/models/User.js`
- `server/models/Subscription.js`
- `server/services/stripeCheckoutService.js`
- `server/services/stripeMembershipService.js`
- `server/tests/stripeCheckoutService.test.js`
- `server/tests/stripeMembershipService.test.js`
- `server/.env.example`
- `render.yaml`
- `client/src/constants/subscriptionPlans.js`
- `client/src/components/MembershipPricingShowcase.jsx`
- `client/src/pages/PricingPage.jsx`
- `client/src/pages/ProfilePage.jsx`
- `client/src/pages/MemberAreaPage.jsx`
- `PRODUCTION_BACKEND_REPORT.md`

## Old Variables Removed

- `STRIPE_PRICE_CIRCLE`
- `STRIPE_PRICE_PRIVATE`

The old subscription plan keys `circle` and `private` were removed from the active subscription plan configuration, frontend pricing cards, member area plan detection, webhook inference tests, and Stripe checkout tests.

## New Variables Added

- `STRIPE_PRICE_BAZINIS`
- `STRIPE_PRICE_ASMENINIS`
- `STRIPE_PRICE_PRIVATUS_VERSLAS`

The new active Stripe subscription plan keys are:

- `bazinis`
- `asmeninis`
- `privatus_verslas`

## Checkout Route Behavior

`POST /api/billing/create-payment-session` now accepts only the canonical Stripe-backed plan keys `bazinis`, `asmeninis`, or `privatus_verslas`.

Invalid plans return HTTP 400 before a Stripe Checkout Session is created. A valid plan with a missing configured Stripe Price ID returns HTTP 500 because the backend cannot safely create a production subscription without a real Stripe Price.

Stripe Checkout Sessions are created with:

- `mode: "subscription"`
- `line_items: [{ price: selectedPlan.priceId, quantity: 1 }]`
- Session metadata: `userId`, `plan`, `planName`, `provider`
- Subscription metadata: `userId`, `plan`, `planName`

## Webhook Behavior

Verified Stripe webhook events remain the source of truth for subscription state. `checkout.session.completed`, subscription lifecycle events, and invoice events now save subscriptions with the new plan key and plan name.

Plan inference checks Stripe subscription metadata key `plan` first, then falls back to the configured Stripe Price IDs for `bazinis`, `asmeninis`, and `privatus_verslas`.

## Required Render Environment Variables

Set these backend environment variables in Render for the new subscription catalog:

- `STRIPE_PRICE_BAZINIS`
- `STRIPE_PRICE_ASMENINIS`
- `STRIPE_PRICE_PRIVATUS_VERSLAS`

Keep these Stripe variables server-only:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

The frontend should continue to use only publishable Stripe configuration when needed. Secret keys must not be exposed to the client bundle.
