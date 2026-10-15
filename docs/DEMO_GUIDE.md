# UMANG — Mentor round demo guide

About 6 minutes. Run a production build so the PWA works: `npm run build && npm start`, then open `http://localhost:3000`.

## Before you start (2 minutes, once)

1. Open `http://localhost:3000/mobile-demo` in Chrome on the presentation laptop and press **Reset demo**.
2. In a second tab, open `http://localhost:3000/choose-role` → **I want to hire**. Fill in your name, "Shree Ganesh Constructions", and **a phone number you control** (this is the number WhatsApp/SMS will open). Leave this tab open as the "employer laptop".
3. Optional: put recorded clips into `public/audio/<lang>/` (see the audio checklist). Without them, the app shows "Recorded audio coming soon" and offers the labelled device voice.

## The story

**1. The editorial site (30 s).** Open `/`. Scroll through the problem ("Talent is everywhere. Opportunity isn't."), the walkthrough and the features. Switch to हिन्दी in the header: the whole site changes language.

**2. The phone (2 min).** Open `/mobile-demo`. Say: "This isn't a video — it's the real app running inside the phone."
- Tap **I WANT WORK** → onboarding in big tiles. Tap **Listen to this** on step 1. Choose Mason, Dadar, an experience level, a name and your own number.
- Open **Find work**, filter by "★ Mason", open *Brickwork mason – residential tower*, show the pay box and **Listen**, then tap **I'm interested**.
- Switch language on the page (मराठी): the phone follows.

**3. Hiring (1.5 min).** Go to the employer tab and open the listing (**Listings → Brickwork mason**). The worker appears as an applicant, with contact locked. Tap **Send offer**: set ₹1,000/day, tools "Trowel, level", tick consent, then **Send offer**.

**4. Accepting (1 min).** Back in the phone: Home shows **Offers waiting for you** → **Review offer** → read the terms → tick consent → **Accept offer** → **View job ticket**.

**5. The ticket (1 min).** Show the ticket code (`UMG-2026-000127`), the agreed terms, and **Communications → Chat on WhatsApp** (opens WhatsApp Web with the prefilled message; nothing is sent until you press send). Click **Print / Save as PDF** to show the A4 layout. In the employer tab, mark the work **started**, then **completed**: the ticket status updates.

**6. Install (30 s).** Open `/install` or use Chrome's address-bar install icon. On a phone this needs HTTPS (see below).

Shortcut if time is short: on the worker Home, **Get a demo offer** creates an offer from a sample employer instantly (clearly labelled as a demo control).

## Showing it on a real phone

Installation and service workers need **HTTPS**. A phone opening `http://192.168.x.x:3000` will run the site, but **cannot install it**. Options:

- **Deploy** (recommended): push to GitHub and import into Vercel, which serves HTTPS. Open the URL on Android Chrome → ⋮ → **Install app**. On iPhone: Safari → Share → **Add to Home Screen**.
- **Tunnel** your local production server over HTTPS (for example Cloudflare Tunnel or ngrok), then open the tunnel URL on the phone.
- `next dev --experimental-https` uses a self-signed certificate; phones usually reject it, so prefer the options above.

Each device has its own data (localStorage). The worker and employer roles only "see" each other in the same browser — this is why the demo uses two tabs on one laptop.

## What to say about limitations

- No backend, login or verification. One-tap access is a demo role switch, not authentication.
- Phone numbers are hidden by the interface only; in production they would be protected server-side.
- WhatsApp and SMS open prefilled drafts. We do not send messages or confirm delivery.
- Tickets record the agreed terms. They are not invoices, proof of payment or contracts.
- UMANG is an independent prototype, not affiliated with the Government of India's UMANG app.
