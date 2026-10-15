# UMANG — Beyond the Waiting Line

**Work should find you.** UMANG is a multilingual (English / हिन्दी / मराठी), audio-assisted job platform prototype that connects skilled workers in Mumbai with nearby employers: clear wages, a full hiring lifecycle, job confirmation tickets, WhatsApp/SMS contact after hire, and an installable mobile app (PWA).

> UMANG is an independent hackathon prototype. It is **not affiliated with the Government of India's UMANG app** or any government agency.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000 (no service worker in dev)
npm run build && npm start   # production mode — needed to test the PWA / offline
```

Demo script for judges: **[docs/DEMO_GUIDE.md](docs/DEMO_GUIDE.md)**.
Audio recording checklist: **[docs/AUDIO_RECORDING_CHECKLIST.md](docs/AUDIO_RECORDING_CHECKLIST.md)**.

## Routes

| Route | What it is |
| --- | --- |
| `/` | Editorial marketing homepage (GSAP, Lenis, 5 sections) |
| `/choose-role` | One-tap demo access: I WANT WORK / I WANT TO HIRE. PWA start URL |
| `/mobile-demo` | Presentation page: story + the live app running inside a phone frame |
| `/worker` | Worker Home: offers, confirmed jobs, applications, demo offer control |
| `/worker/onboarding` | 5-step setup (language, trade, area, experience, name/phone) |
| `/worker/jobs`, `/worker/jobs/[id]` | Find work (filters) and job detail with offer review |
| `/worker/applications` | My jobs: Applied / Saved / Ticket history |
| `/worker/profile`, `/worker/rights` | Skill card editor; rights & welfare |
| `/employer` | Listings, capacity, ticket history, edit details |
| `/employer/post`, `/employer/jobs/[id]`, `/employer/jobs/[id]/edit` | Post, manage applicants & offers, edit |
| `/employer/workers` | Browse worker skill cards with job matching |
| `/tickets/[id]` | Job confirmation ticket (print / PDF / share / copy / contact) |
| `/faq` | Searchable multilingual FAQ (20 questions, 5 categories) |
| `/install` | Install guidance (Android, iPhone, desktop) |
| `/offline` | Offline fallback served by the service worker |
| `/manifest.webmanifest`, `/sw.js`, `/api/audio-index` | PWA manifest, service worker, recorded-audio index |

## Hiring lifecycle

`available → interested → shortlisted → offered → accepted → confirmed → in_progress → completed`, with exits to `declined` (by either side) and `cancelled`. Job publication state (`open / closed / cancelled`) is separate from each worker's application.

- Transitions and who may trigger them live in [`src/lib/lifecycle.ts`](src/lib/lifecycle.ts); the store ([`src/lib/store.ts`](src/lib/store.ts)) applies them and records every change in `history`.
- Accepting checks the job is open, not cancelled and not full, and requires the worker's consent to share their number. Acceptance is idempotent: one confirmed hire produces exactly one ticket (`UMG-YYYY-NNNNNN`, sequential per device).
- Offers snapshot the terms; the ticket stores the accepted terms, so later listing edits don't change it.

## Contact (WhatsApp / SMS / call)

Built in [`src/lib/contact.ts`](src/lib/contact.ts): Indian numbers normalised to `91XXXXXXXXXX`, `https://wa.me/<number>?text=<encoded>`, `sms:+91…?body=` (`&body=` on iOS), `tel:+91…`. Links appear **only after a confirmed hire**, only for complete numbers the other side agreed to share. Masked sample numbers (e.g. `98XXXXXX21`) never produce links. Nothing is sent automatically, and delivery is not tracked.

## Voice guidance

- Manifest: [`src/lib/audio-guides.ts`](src/lib/audio-guides.ts) — 9 clips × 3 languages, with scripts.
- Drop MP3s into `public/audio/<en|hi|mr>/` using the manifest file names. `npm run audio:check` shows what exists. No code change needed.
- Missing clips show "Recorded audio coming soon" plus an optional, clearly labelled **device voice** (browser text-to-speech). Job details and tickets also offer device-voice summaries, because recordings can't cover every new listing.
- One clip at a time, never autoplay, 0.75× / 1× / 1.25× speed.

## PWA

`src/app/manifest.ts`, icons in `public/icons/`, hand-written service worker `public/sw.js` (no extra dependency). It caches hashed static assets and public page shells only — never `/api`, audio, or user data (which lives in localStorage). Installing requires **HTTPS** (or `localhost`).

## Data & privacy (prototype)

All data is stored in this browser's localStorage (key `kaamsetu-v1`, kept from the earlier prototype so data migrates; schema v2 with a migration). There is no backend, no login, and no verification. "Hidden" phone numbers are a UI restriction, not server-enforced privacy. One-tap access selects a demo role; it is not authentication.

## Tech

Next.js 16 (App Router, Cache Components), React 19, TypeScript, Tailwind CSS 4, Zustand, GSAP, Lenis, lucide-react.
