# amora-experience-demo
Amora — Relationship Passport App

A warm, playful "escape room meets relationship playground" web app for couples at any stage of their journey. Couples link accounts, complete onboarding surveys, attend curated experiences, collect stamps, and progress through milestone pillars together.

Features

- Love Passport & Stamps — Paginated passport organized by milestone pillars (Sync Up, Altitude Resilience, etc.) with auto-awarded stamps based on admin-defined unlock criteria.
- Milestones — Six pillars that aggregate progress across the relationship journey.
- Events & Activities — Physical and digital experiences with rich detail cards, expandable descriptions, and admin-uploaded imagery.
- Secure QR Check-In — Time-limited, signed, server-validated HEX event codes (`AMORA-XXXXXXXX`) generated per event, downloadable for print, validated via `validate_event_checkin` RPC to prevent duplicate claims.
- Rewards — Perks, experiences, and partner offers with time-limited durations and in-app "Open / Mark as used" flow.
- Promo Codes — Admin-managed redemption codes, including `AMORADEMO` for non-persistent investor demos with a visible Demo Mode badge.
- Partner Linking — Mutual consent flow with explicit T&Cs, debounced code lookup, accept/reject requests, and clean unlinking that revokes shared access on both sides.
- Onboarding & Re-Surveys — Multi-select preference capture with automatic prompts at 3mo, 6mo, 1yr, 1.5yr, and 2yr to track relationship evolution and refine recommendations.
- Recommendation Engine — Scoring model (base 100, +30 goal match, ±preferences) that prioritizes physical events and personalizes the top three with a "Recommended" tag.
- Notifications — Real-time bell with deep links to event details, dismiss/mark-read/mark-all-read, partner-name personalization, duplicate prevention, and audience scoping to active passport holders.
- Admin Panel — RBAC-protected management of Events, Rewards, Activities, Milestones, Stamps, Promo Codes, and Users; visual icon pickers, engagement analytics, audit changelog with full filtering, and role promotion/demotion.
- Demo Mode — `AMORADEMO` populates a lived-in journey (stamps, milestones, events, activities) for stakeholder demos; auto-clears on logout.

Tech Stack

- Frontend: React 18, Vite 5, TypeScript 5, Tailwind CSS v3, shadcn/ui
- Backend: Lovable Cloud (Supabase) — Postgres with strict RLS, SECURITY DEFINER RPCs, Realtime subscriptions, Storage, Auth (email + Google OAuth)
- QR: `html5-qrcode` scanner + server-signed HEX codes
- Design: Light theme only, deep wine (`#9C2229`) + champagne gold, Playfair Display + DM Sans, Amora glyph branding

Security Posture

- Row Level Security on every public table with explicit `GRANT`s scoped to roles
- `EXECUTE` revoked from `PUBLIC`/`anon` on all SECURITY DEFINER functions
- Sensitive columns (`partner_code`, reward `code`, promo `code`) hidden from direct SELECT; accessed only via owner-scoped RPCs
- Roles stored in a separate `user_roles` table with `has_role()` security-definer checks to prevent privilege escalation
- Partner linking requires mutual consent; unlinking revokes read access bidirectionally
- Storage bucket locked down against object listing

Getting Started

```bash
bun install
bun run dev
```

The app runs on `http://localhost:8080`. Backend is provisioned automatically via Lovable Cloud.
