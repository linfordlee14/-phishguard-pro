# PRD

## Original Problem Statement
I have a React + Vite + TypeScript + Firebase phishing simulation SaaS called PhishGuard Pro. The repo is already connected. The app builds clean with zero TypeScript errors.

I want a premium SaaS UI upgrade across the entire authenticated app shell. Reference: Linear.app, Vercel dashboard, Stripe dashboard.

Design system requirements:
- Dark-first (already dark — keep it)
- Font: Inter for body, JetBrains Mono for data/numbers
- Primary accent: #00d4ff (cyan) — already set
- Background layers: #080f1c → #0c1628 → #111c2d → #162035
- No colored side borders on cards
- No gradient buttons — solid cyan only
- No purple/indigo — this is a security product

Specific UI changes needed:
1. APP SIDEBAR
2. DASHBOARD PAGE
3. CAMPAIGN LIST PAGE
4. LOADING STATES
5. GLOBAL

Keep all existing routes, hooks, Firestore calls, and component interfaces unchanged. Only update visual/layout layer.

After implementation: run npm run build and fix all errors. Show me the changed files list when done.

## Architecture Decisions
- Kept the existing React + Vite + TypeScript + Firebase structure and route map unchanged.
- Applied the visual refresh primarily through shared shell/layout/UI primitives so the rest of the authenticated app inherits the new design.
- Added a safe Firebase startup guard to prevent runtime white-screen crashes when VITE_FIREBASE_* values are missing or invalid.
- Preserved existing Firestore hooks, campaign/employee flows, and page routing contracts.

## Implemented
- Premium dark shell refresh with layered backgrounds, improved cards, inputs, selects, buttons, badges, shimmer loaders, page transitions, and bottom-right toasts.
- Collapsible sidebar with icon-only mode, custom hover tooltips, active cyan state, profile block, settings access, and bottom collapse control.
- Dashboard redesign with glass KPI cards, SVG risk gauge, refined Recharts line chart, AI insight card, risky employees table, and upgraded recent campaigns section.
- Campaign list redesign into premium campaign cards with status mapping, send date, click-rate progress bars, and animated empty state.
- Loader updates for all touched loading views plus Firebase config fallback messaging on auth pages.
- Verified successful production build with `npm run build`.

## Prioritized Backlog
### P0
- Provide valid VITE_FIREBASE_* runtime values so authenticated flows can be exercised end-to-end.
- Add/verify authenticated screenshots for dashboard and campaign pages once Firebase runtime config is available.

### P1
- Extend `data-testid` coverage to remaining untouched interactive controls across the app.
- Add route-level code splitting to reduce the large production chunk warning.

### P2
- Bring the same premium polish deeper into employees, reports, billing, settings, and training detail views.
- Add richer empty/loading states for every remaining page.

## Next Tasks
- Re-test authenticated shell routes after valid Firebase client env values are present.
- Capture dashboard and campaigns screenshots with live data.
- Continue page-by-page UI harmonization across the remaining authenticated views.
