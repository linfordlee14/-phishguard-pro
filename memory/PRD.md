# PRD

## Original Problem Statement
User requested two sequential tasks:

### Task 1 — Fix Landing Page to Match App Aesthetic
- Rebuild `src/pages/landing/LandingPage.tsx` so it matches the premium dark SaaS shell already applied to the authenticated product.
- Match the same dark layered background, Inter + JetBrains Mono typography, cyan accent, dark glass cards, solid cyan buttons, subtle cyan borders, sidebar-style branding, screenshot-style real product mockup, refreshed features/pricing/testimonials/footer, and move all landing styling into `src/pages/landing/landing.module.css`.

### Task 2 — First-Run Onboarding Flow
- After registration and org creation, require new users to complete a 3-step onboarding wizard before reaching the dashboard.
- Trigger based on `onboardingCompleted` on the org document.
- Add protected `/onboarding` route outside the app shell.
- Step 1 updates org doc with `name`, `adminRole`, and `onboardingStartedAt`.
- Step 2 imports employees via CSV or manual entry into the existing root `employees` collection with `orgId`.
- Step 3 marks onboarding complete and routes to campaign creation or dashboard.
- Finish with `npm run build` and show changed files.

## User Clarifications
- Keep using the existing root `employees` collection with `orgId` for onboarding employee writes.
- Keep using the existing org field name `name` instead of switching to `orgName`.

## Architecture Decisions
- Preserved the existing React + Vite + TypeScript + Firebase architecture and route map.
- Kept onboarding employee writes compatible with the current data model by using the root `employees` collection instead of introducing a new subcollection pattern.
- Added onboarding gating at the protected-route layer while keeping `/onboarding` outside the authenticated shell layout.
- Updated auth state to listen to the organization document in real time so onboarding completion immediately unlocks the main app without a reload.
- Rebuilt the landing page with isolated CSS modules to prevent style leakage into the authenticated shell.

## Implemented
- Rebuilt the landing page to visually match the premium in-app aesthetic with sidebar-style branding, cyan CTA buttons, layered dark background, premium feature/pricing/testimonial sections, and a product-specific dashboard mockup.
- Moved all landing page styling into `src/pages/landing/landing.module.css` and removed the old inline/style-injection approach.
- Added protected `/onboarding` route and a full-screen 3-step onboarding wizard.
- Step 1 now saves organization `name`, `adminRole`, and `onboardingStartedAt`.
- Step 2 supports CSV parsing preview and manual employee entry (up to 5 rows), then batch writes onboarding employees into the root `employees` collection.
- Step 3 marks `onboardingCompleted` and `onboardingCompletedAt`, then routes users to `/campaigns/create` or `/dashboard`.
- Updated `useAuth` and `ProtectedRoute` so incomplete organizations are sent to onboarding and completed organizations bypass it.
- Confirmed `npm run build` passes successfully.

## Prioritized Backlog
### P0
- Add authenticated end-to-end onboarding verification once valid Firebase client environment values are available.
- Capture real post-login screenshots for `/onboarding`, `/dashboard`, and `/campaigns/create` with live data.

### P1
- Add dedupe safeguards for onboarding employee imports so repeated submissions cannot create duplicates.
- Extend onboarding with first-campaign prefill if the campaign creation page should inherit onboarding choices.

### P2
- Code-split large route bundles to reduce the current production chunk warning.
- Add richer empty states and deeper premium polish to remaining non-upgraded pages.

## Next Tasks
- Validate the first-run onboarding path with a working Firebase client setup.
- Optionally prefill the campaign builder with the onboarding template selection.
- Expand the landing page footer links to real policy/help pages if those routes are added later.
