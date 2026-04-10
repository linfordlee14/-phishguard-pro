# PRD

## Original Problem Statement
Add PayFast subscription billing to PhishGuard Pro, using PayFast (South Africa) only.

Required sequence:
1. Backend PayFast checkout + webhook in `backend/app.py`
2. Frontend checkout API helper in `src/services/api.ts`
3. Real billing page using existing shell/components
4. Billing success page with confetti
5. Plan enforcement in employees + billing routes

Constraints:
- Keep existing Firestore org fields in use: `name`, `plan`, `seatsLimit`, `onboardingCompleted`, `adminRole`
- Keep root `employees` collection filtered by `orgId`
- Reuse existing UI components (`Button`, `Card`, `Badge`, `Modal`, `ProgressBar`)
- App URL: `https://phishguard-pro.linfytech.xyz`
- Do not use Stripe, Paddle, or any non-ZAR gateway
- Do not change existing Firestore query patterns outside listed org doc billing updates
- Do not change the onboarding flow

## User Clarifications
- Use the provided PayFast sandbox defaults for now.
- Use a smart default feature set on the billing plan cards that matches the current product.

## Architecture Decisions
- Implemented PayFast as a hosted redirect flow: frontend requests a checkout URL from the Flask backend, then redirects the browser to PayFast.
- Added backend signature generation and ITN webhook verification directly in `backend/app.py` to keep billing logic close to the existing backend surface.
- Kept Firestore writes limited to organization plan/billing fields from the webhook and reused the existing root `employees` collection for seat enforcement.
- Replaced the old mocked billing page with a real data-driven billing experience inside the existing app shell.
- Added a protected billing success page and seat-limit gating without changing campaign/training/onboarding flows.

## Implemented
- Added backend `PLANS`, `/api/billing/create-checkout`, and `/api/billing/webhook` endpoints with PayFast signature verification, sandbox-aware IP checks, and org billing updates.
- Updated `backend/.env.example` with `PAYFAST_MERCHANT_ID`, `PAYFAST_MERCHANT_KEY`, `PAYFAST_PASSPHRASE`, `PAYFAST_SANDBOX=true`, and `BACKEND_URL`.
- Added `createCheckout()` to `src/services/api.ts`.
- Rebuilt `src/pages/billing/Billing.tsx` to load org + employee data, show current plan/seat usage, render real upgrade cards, and redirect to PayFast checkout.
- Added `src/pages/billing/BillingSuccess.tsx` with confetti, plan confirmation UI, and post-payment CTA paths.
- Added the confetti CDN script to `index.html`.
- Added seat-limit enforcement in `src/pages/employees/EmployeeList.tsx` using the existing `Modal` component and billing routing.
- Added `/billing/success` to the protected app routes.
- Verified `python -m py_compile backend/app.py` passes.
- Verified `npm run build` passes successfully.

## Prioritized Backlog
### P0
- Test PayFast sandbox end-to-end with real sandbox callbacks against a reachable backend URL.
- Confirm Firestore org documents consistently include `seatsLimit` for all existing customer records.

### P1
- Persist payment history records for display on the billing page instead of the current placeholder section.
- Add stronger webhook auditing/logging around repeated ITN notifications and billing transitions.

### P2
- Code-split large frontend bundles to reduce the current chunk warning.
- Add invoice export/download actions once payment history is stored.

## Next Tasks
- Run a live sandbox checkout and webhook test with PayFast credentials and a public backend callback URL.
- Backfill `seatsLimit` on any org docs that still rely on older seat fields.
- Replace the payment-history placeholder with real Firestore-backed payment records if required.
