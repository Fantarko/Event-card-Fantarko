# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Commands

```bash
npm run dev      # Start development server at http://localhost:3000
npm run build    # Build for production
npm run start    # Start production server (after build)
npm run lint     # Run ESLint (eslint-config-next with core-web-vitals + TypeScript rules)
```

There is no test framework configured in this project.

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` — PostHog project token
- `NEXT_PUBLIC_POSTHOG_HOST` — PostHog host URL
- `MONGODB_URL` — MongoDB connection string (not yet used in application code)

## Architecture

**Next.js 16.2.1** App Router application using **React 19**, **TypeScript**, **Tailwind CSS v4**, and **shadcn/ui**.

Path alias `@/` resolves to the project root (e.g. `@/components/Navbar`, `@/lib/utils`).

### Data Flow

Event data is currently static — defined as a plain array in `lib/constants.ts` and rendered directly in `app/page.tsx`. There is no API layer or database integration yet (MongoDB URL is available but unused).

### Component Boundaries

Components that use browser APIs or PostHog must be marked `'use client'`. The root layout (`app/layout.tsx`) is a Server Component that composes `<Navbar>` and `<LightRays>` as a full-viewport background layer (`z-[-1]`) with `<main>` rendered on top.

### PostHog Analytics

PostHog is initialized in `instrumentation-client.ts` (the Next.js 15.3+ recommended pattern for client-side init). Requests are proxied through `/ingest` via rewrites in `next.config.ts` for ad-blocker resilience — do not change this proxy setup.

Tracked events:
- `explore_events_clicked` — fired in `components/ExploreBtn.tsx` on CTA button click
- `event_card_clicked` — fired in `components/EventCard.tsx` on card click, with `{ title, slug, location, date }` properties

When adding new analytics, capture events in the event handler directly — do **not** use `useEffect` to trigger PostHog captures in response to state changes.

A PostHog skill is available at `.claude/skills/integration-nextjs-app-router/SKILL.md` for guidance on extending the PostHog integration (feature flags, user identification, error tracking).

### UI / Styling

- **shadcn/ui** is configured with the `radix-nova` style, Tailwind CSS variables, and `lucide-react` icons. Add new components via `npx shadcn add <component>`.
- **Tailwind CSS v4** — no `tailwind.config.js`; configuration lives in `app/globals.css`.
- Custom fonts loaded via `next/font/google`: `--font-sans` (Geist), `--font-schibsted-grotesk`, `--font-martian-mono`.
- `lib/utils.ts` exports `cn()` (clsx + tailwind-merge) for conditional class merging.
- `components/LightRays.tsx` is a WebGL background effect using the `ogl` library — it manages its own WebGL lifecycle with IntersectionObserver-based pause/resume. Avoid re-rendering it unnecessarily.
