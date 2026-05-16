---
name: BAIC Test Drive Project State
description: Status dan konteks project baic-testdrive — booking system GIIAS 2026
type: project
---

Project booking test drive BAIC ARCFOX untuk GIIAS ICE BSD 30 Jul–9 Agt 2026.

**Why:** Demo untuk klien BAIC dijadwalkan 19 Mei 2026. Sistem menggantikan antrian fisik dengan antrian digital berbasis WhatsApp.

**Stack:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + Supabase + Fonnte WA API + Vercel

**Phase 1 (DONE):**
- Landing page, /booking, /booking/form, /booking/confirm, /booking/check
- API: /api/booking/create, /api/slots/availability, /api/booking/check
- Lib: supabase.ts, supabase-server.ts, fonnte.ts (mock mode jika no token), booking-utils.ts, constants.ts
- Design system: dark luxury (#0A0A0F bg, #4F8EF7 accent), fonts DM Serif Display + DM Sans + JetBrains Mono
- SQL migration di supabase/migration.sql (siap di-run di Supabase SQL Editor)

**Phase 2 (belum):** Integrasi Fonnte real + cron reminder

**Phase 3 (belum):** Dashboard Supabase Auth (/dashboard/*)

**How to apply:** Saat melanjutkan project ini, Phase 1 sudah selesai. Next step: setup Supabase project, run migration.sql, isi .env.local dengan credentials asli, lalu lanjut Phase 2.
