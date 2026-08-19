# USHUS 2026

A single static landing page for USHUS 2026, the flagship MBA management fest of the School of Business and Management (MBA), Bangalore Central Campus, CHRIST (Deemed to be University).

Lists the 10 fest events with early-bird pricing and a full-contingent option. Every "Register" button links out to a Google Form, which also handles payment. There is no backend, database, or authentication — the whole site is one static page.

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- next/font (self-hosted Trajan Pro + Inter)

## Getting Started

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

## Updating the registration link

The Google Form URL lives in one place: `REGISTER_FORM_URL` in `app/page.tsx`.

## Updating events, pricing, or logos

Event data (name, team size, crest logo) lives in `lib/logos.ts`. Crest images are in `public/logos/`. Pricing is written directly into `app/page.tsx`.
