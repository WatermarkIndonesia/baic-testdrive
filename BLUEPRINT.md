# BLUEPRINT.md
# BAIC ARCFOX — GIIAS 2026 Test Drive Booking System
# Project: baic-testdrive
# Directory: /Users/candrian/Claude Project/baic-testdrive
# Prepared by: Watermark Indonesia
# Last updated: 16 May 2026

---

## 1. PROJECT OVERVIEW

Single-entry mobile-first microsite untuk pre-booking test drive BAIC ARCFOX di GIIAS ICE 2026 (ICE BSD, 30 Jul – 9 Aug 2026).

**Core purpose:**
- Customer premium dapat book slot test drive sebelum / saat tiba di pameran
- Tidak ada waiting experience yang buruk — sistem notifikasi WA otomatis mengingatkan customer sebelum slot mereka
- Internal Watermark + BAIC dapat memonitor real-time melalui dashboard

**Key principle:** Customer premium tidak boleh menunggu tanpa kepastian. Sistem ini menggantikan antrian fisik dengan antrian digital yang elegan.

---

## 2. TECH STACK

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL + Realtime) |
| Auth (dashboard) | Supabase Auth |
| WA Notification | Fonnte API |
| Deployment | Vercel |
| Cron / Scheduler | Vercel Cron Jobs (untuk reminder otomatis) |

---

## 3. GIIAS ICE 2026 — OPERATIONAL PARAMETERS

```
Venue     : ICE BSD, Tangerang
Event     : 30 Juli – 9 Agustus 2026 (11 hari)
Jam buka  : 10:00 WIB
Jam tutup : 21:00 WIB
TD cutoff : 20:00 WIB (1 jam sebelum tutup)
TD slot   : 30 menit per sesi per unit
Notif WA  : 15 menit sebelum slot
```

**4 Unit Test Drive:**
| ID | Model | Variant |
|---|---|---|
| `bj40plus` | BJ40 Plus | CKD – Black |
| `bj30hev-awd` | BJ30 HEV AWD | Apple Green |
| `bj30hev-fwd` | BJ30 HEV FWD | Bubble Grey |
| `x55ii` | X55 II Prime | Black |

**Slot kapasitas per unit per hari:**
- 10:00 – 20:00 = 10 jam = 20 slot × 30 menit
- Total kapasitas: 4 unit × 20 slot = **80 booking/hari**
- Total 11 hari: max **880 booking**

---

## 4. DATABASE SCHEMA (Supabase)

### Tabel: `bookings`
```sql
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_code TEXT UNIQUE NOT NULL, -- format: BTC-XXXXXX
  
  -- Data Customer
  nama TEXT NOT NULL,
  nomor_wa TEXT NOT NULL,         -- format: 628xxxxxxxxxx
  domisili TEXT NOT NULL,
  kendaraan_saat_ini TEXT NOT NULL,
  
  -- Booking Detail
  model_id TEXT NOT NULL,          -- bj40plus | bj30hev-awd | bj30hev-fwd | x55ii
  model_nama TEXT NOT NULL,
  tanggal DATE NOT NULL,           -- 2026-07-30 s/d 2026-08-09
  slot_waktu TIME NOT NULL,        -- 10:00, 10:30, 11:00, dst
  
  -- Status
  status TEXT DEFAULT 'confirmed', -- confirmed | reminded | completed | cancelled | no_show
  
  -- Notifikasi
  reminder_sent BOOLEAN DEFAULT FALSE,
  reminder_sent_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  source TEXT DEFAULT 'microsite'  -- microsite | walk-in | admin
);
```

### Tabel: `car_models`
```sql
CREATE TABLE car_models (
  id TEXT PRIMARY KEY,             -- bj40plus | bj30hev-awd | bj30hev-fwd | x55ii
  nama TEXT NOT NULL,
  variant TEXT NOT NULL,
  warna TEXT NOT NULL,
  deskripsi TEXT,
  spesifikasi JSONB,               -- key specs object
  gambar_url TEXT,                 -- path ke public image
  is_active BOOLEAN DEFAULT TRUE,
  urutan INT
);
```

### Tabel: `blocked_slots`
```sql
-- Untuk block slot tertentu (maintenance, media day, dll)
CREATE TABLE blocked_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  model_id TEXT NOT NULL,
  tanggal DATE NOT NULL,
  slot_waktu TIME NOT NULL,
  alasan TEXT,
  blocked_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabel: `dashboard_users`
```sql
-- Extend Supabase auth.users
CREATE TABLE dashboard_users (
  id UUID REFERENCES auth.users PRIMARY KEY,
  nama TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,   -- 'wtm_admin' | 'baic_admin' | 'sales_view'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security (RLS)
```sql
-- bookings: public INSERT (customer booking), read hanya dashboard user
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public dapat insert booking"
  ON bookings FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Dashboard user dapat baca semua"
  ON bookings FOR SELECT TO authenticated USING (true);

CREATE POLICY "WTM admin dapat update status"
  ON bookings FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dashboard_users
      WHERE id = auth.uid()
      AND role IN ('wtm_admin', 'baic_admin')
    )
  );
```

---

## 5. SITE STRUCTURE & PAGES

```
/                         → Landing / Hero page
/booking                  → Step 1: Pilih model + tanggal + slot
/booking/form             → Step 2: Isi data customer
/booking/confirm          → Step 3: Konfirmasi + booking code
/booking/check            → Customer cek status booking via booking code / no WA
/models/[id]              → Detail model + spesifikasi (optional deep dive)
/dashboard                → Protected: login Supabase Auth
/dashboard/overview       → Live stats (traffic, bookings, conversion)
/dashboard/bookings       → Tabel semua booking + filter + search
/dashboard/slots          → Manajemen slot & block
/api/booking/create       → POST: create booking + kirim WA konfirmasi
/api/booking/check        → GET: cek status booking
/api/notify/reminder      → POST: trigger reminder (dipanggil cron)
/api/cron/send-reminders  → Vercel Cron: jalankan tiap 10 menit
```

---

## 6. USER FLOW — CUSTOMER

```
[LANDING PAGE]
  ↓ CTA: "Book Test Drive Sekarang"

[STEP 1 — PILIH UNIT]
  → Grid 4 kartu unit (foto, nama, highlight spec)
  → Tap unit → expand detail / spec
  → Pilih unit → lanjut

[STEP 2 — PILIH TANGGAL & SLOT]
  → Calendar picker (hanya tanggal 30 Jul – 9 Agt 2026)
  → Slot grid per jam (10:00–20:00, step 30 menit)
  → Slot warna: hijau=tersedia, abu=habis, merah=blocked
  → Real-time availability dari Supabase

[STEP 3 — ISI DATA]
  → Nama lengkap
  → Nomor WhatsApp (format otomatis 628xx)
  → Domisili (dropdown: kota)
  → Model kendaraan yang dimiliki saat ini (free text)
  → Konfirmasi: "Saya setuju dihubungi via WhatsApp"

[STEP 4 — KONFIRMASI]
  → Summary booking (unit, tanggal, jam, nama)
  → Booking code: BTC-XXXXXX (random 6 char)
  → "Konfirmasi WA telah dikirim ke 0812xxx"
  → QR code atau deep link untuk cek status
  → Share to WA button

[WA KONFIRMASI — dikirim otomatis via Fonnte]
---
Halo [Nama],

Booking Test Drive BAIC ARCFOX Anda telah DIKONFIRMASI.

Detail:
Unit     : [Model Nama]
Tanggal  : [Hari, DD MMMM 2026]
Waktu    : [HH:MM] WIB
Lokasi   : Booth BAIC, ICE BSD — Hall [X]
Kode     : [BTC-XXXXXX]

Kami akan mengirimkan pengingat 15 menit sebelum waktu Anda.
Sampai jumpa di GIIAS 2026!

— Tim BAIC Indonesia
---

[WA REMINDER — 15 menit sebelum slot]
---
[Nama], test drive Anda dimulai dalam 15 menit!

Unit  : [Model Nama]
Waktu : [HH:MM] WIB — HARI INI

Silakan menuju area test drive BAIC sekarang.
Tunjukkan kode: [BTC-XXXXXX]

See you soon!
— BAIC GIIAS 2026
---
```

---

## 7. USER FLOW — DASHBOARD

```
[LOGIN]
  → Email + password (Supabase Auth)
  → Redirect sesuai role

[OVERVIEW]
  → Total booking hari ini / total keseluruhan
  → Booking per unit (donut chart)
  → Slot utilization per hari (bar chart)
  → Hot prospects counter
  → Status breakdown: confirmed / reminded / completed / no_show

[BOOKINGS TABLE]
  → Filter: tanggal, model, status, domisili
  → Search: nama, no WA, booking code
  → Action (wtm_admin / baic_admin only): ubah status, cancel
  → Export CSV

[SLOT MANAGEMENT — wtm_admin only]
  → Lihat semua slot per tanggal per unit
  → Block/unblock slot
  → Tambah walk-in booking manual
```

---

## 8. API ROUTES

### POST /api/booking/create
```typescript
// Request body
{
  nama: string
  nomor_wa: string        // akan dinormalisasi ke 628xx
  domisili: string
  kendaraan_saat_ini: string
  model_id: string
  tanggal: string         // YYYY-MM-DD
  slot_waktu: string      // HH:MM
}

// Logic:
// 1. Validasi slot masih available (cek bookings + blocked_slots)
// 2. Generate booking_code: "BTC-" + 6 random alphanum uppercase
// 3. Insert ke tabel bookings
// 4. Kirim WA konfirmasi via Fonnte
// 5. Return booking_code + detail

// Response 200
{
  success: true
  booking_code: "BTC-A3K9XZ"
  detail: { ... }
}

// Response 409 — slot sudah penuh
{
  success: false
  error: "SLOT_UNAVAILABLE"
  message: "Slot ini sudah penuh. Silakan pilih waktu lain."
}
```

### GET /api/booking/check?code=BTC-XXXXXX
```typescript
// Return status booking customer
{
  booking_code: string
  nama: string
  model_nama: string
  tanggal: string
  slot_waktu: string
  status: string
}
```

### POST /api/notify/reminder (dipanggil oleh cron)
```typescript
// Logic:
// 1. Query bookings WHERE status = 'confirmed'
//    AND tanggal = TODAY
//    AND slot_waktu = NOW + 15 menit (window: 14-16 menit)
//    AND reminder_sent = FALSE
// 2. Untuk tiap booking: kirim WA reminder via Fonnte
// 3. Update reminder_sent = TRUE, reminder_sent_at = NOW()
// 4. Update status = 'reminded'
```

### GET /api/slots/availability?model_id=X&tanggal=YYYY-MM-DD
```typescript
// Return array slot dengan status availability
{
  slots: [
    { waktu: "10:00", available: true, sisa: 1 },
    { waktu: "10:30", available: false, sisa: 0 },
    ...
  ]
}
// Note: per slot per unit = 1 booking (1 mobil, 1 customer per sesi)
```

---

## 9. FONNTE INTEGRATION

```typescript
// lib/fonnte.ts

const FONNTE_API_URL = "https://api.fonnte.com/send"
const FONNTE_TOKEN = process.env.FONNTE_TOKEN  // dari .env.local

export async function sendWhatsApp(
  nomor: string,    // format: 628xxxxxxxxxx
  pesan: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(FONNTE_API_URL, {
      method: "POST",
      headers: {
        "Authorization": FONNTE_TOKEN!,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        target: nomor,
        message: pesan,
        countryCode: "62"
      })
    })
    const data = await res.json()
    return { success: data.status === true }
  } catch (err) {
    console.error("Fonnte error:", err)
    return { success: false, error: String(err) }
  }
}

// MOCK MODE (saat TOKEN belum tersedia):
// Jika FONNTE_TOKEN tidak ada di env, log ke console saja
// dan return { success: true } supaya flow tidak break saat demo
```

---

## 10. VERCEL CRON JOB

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/send-reminders",
      "schedule": "*/10 * * * *"
    }
  ]
}
```

Cron berjalan setiap 10 menit. Di dalam handler, query booking yang slot-nya 15 menit dari sekarang (window 14–16 menit) dan belum dikirim reminder.

---

## 11. ENVIRONMENT VARIABLES

```env
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxx
SUPABASE_SERVICE_ROLE_KEY=xxxx   # untuk server-side operations

# Fonnte
FONNTE_TOKEN=xxxx                # menyusul — mock jika kosong

# App Config
NEXT_PUBLIC_APP_URL=https://baic-testdrive.vercel.app
CRON_SECRET=xxxx                 # untuk validasi cron request
```

---

## 12. DESIGN SYSTEM — UI DIRECTION

**Tone:** Luxury minimal — refined, confident, premium. Sesuai brand ARCFOX "Smart, Elegant, Pure"

**Color Palette:**
```css
--color-bg:         #0A0A0F    /* Near-black — primary background */
--color-surface:    #12121A    /* Card/panel surface */
--color-border:     #1E1E2E    /* Subtle border */
--color-accent:     #4F8EF7    /* ARCFOX blue — CTA, highlight */
--color-accent-2:   #7C5CBF    /* Purple — ARCFOX T1 accent */
--color-text:       #F0F0F5    /* Primary text */
--color-text-muted: #8888AA    /* Secondary text */
--color-success:    #22C55E    /* Slot available */
--color-error:      #EF4444    /* Slot full */
--color-warning:    #F59E0B    /* Slot hampir habis */
```

**Typography:**
- Display / heading: `Bebas Neue` atau `DM Serif Display` — bold, premium
- Body / UI: `DM Sans` — clean, modern, readable di mobile
- Data / code: `JetBrains Mono` — untuk booking code

**Mobile-first breakpoints:**
- Base: 390px (iPhone 14)
- md: 768px (tablet)
- lg: 1024px (desktop dashboard)

**Component priorities:**
1. Slot grid — harus intuitif, color-coded, tap-friendly (min 44px target)
2. Booking confirmation card — premium feel, shareable screenshot
3. Dashboard table — dense tapi scannable

---

## 13. FOLDER STRUCTURE

```
baic-testdrive/
├── app/
│   ├── page.tsx                  # Landing
│   ├── booking/
│   │   ├── page.tsx              # Step 1: Pilih model
│   │   ├── form/page.tsx         # Step 2 + 3: Data + konfirmasi
│   │   ├── confirm/page.tsx      # Step 4: Booking confirmed
│   │   └── check/page.tsx        # Cek status booking
│   ├── models/
│   │   └── [id]/page.tsx         # Detail model
│   ├── dashboard/
│   │   ├── layout.tsx            # Protected layout + auth check
│   │   ├── page.tsx              # Overview
│   │   ├── bookings/page.tsx     # Booking table
│   │   └── slots/page.tsx        # Slot management
│   └── api/
│       ├── booking/
│       │   ├── create/route.ts
│       │   └── check/route.ts
│       ├── slots/
│       │   └── availability/route.ts
│       ├── notify/
│       │   └── reminder/route.ts
│       └── cron/
│           └── send-reminders/route.ts
├── components/
│   ├── ui/                       # Base components (Button, Card, Badge, etc.)
│   ├── booking/
│   │   ├── ModelCard.tsx
│   │   ├── SlotGrid.tsx
│   │   ├── BookingForm.tsx
│   │   └── ConfirmationCard.tsx
│   └── dashboard/
│       ├── StatsCard.tsx
│       ├── BookingsTable.tsx
│       └── SlotManager.tsx
├── lib/
│   ├── supabase.ts               # Supabase client (browser)
│   ├── supabase-server.ts        # Supabase client (server)
│   ├── fonnte.ts                 # WA notification
│   ├── booking-utils.ts          # Generate code, normalize WA, validate slot
│   └── constants.ts              # GIIAS dates, jam operasional, car models data
├── types/
│   └── index.ts                  # TypeScript types
├── public/
│   └── models/                   # Gambar unit test drive
│       ├── bj40plus.jpg
│       ├── bj30hev-awd.jpg
│       ├── bj30hev-fwd.jpg
│       └── x55ii.jpg
├── vercel.json                   # Cron config
├── .env.local                    # Environment variables
└── BLUEPRINT.md                  # File ini
```

---

## 14. CAR MODELS DATA (constants.ts)

```typescript
// lib/constants.ts

export const GIIAS_START_DATE = "2026-07-30"
export const GIIAS_END_DATE = "2026-08-09"
export const OPERATING_HOURS_START = "10:00"
export const OPERATING_HOURS_END = "20:00"  // cutoff 1 jam sebelum tutup (21:00)
export const SLOT_DURATION_MINUTES = 30
export const REMINDER_MINUTES_BEFORE = 15

// Generate array of slots: ["10:00", "10:30", ..., "19:30"]
export function generateSlots(): string[] {
  const slots: string[] = []
  let hour = 10, minute = 0
  while (hour < 20 || (hour === 19 && minute === 30)) {
    slots.push(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`)
    minute += 30
    if (minute >= 60) { minute = 0; hour++ }
  }
  return slots
}
// Result: 20 slots per unit per hari

export const CAR_MODELS = [
  {
    id: "bj40plus",
    nama: "BJ40 Plus",
    variant: "CKD",
    warna: "Phantom Black",
    tagline: "Born for the Untamed",
    deskripsi: "SUV off-road legendaris dengan powertrain terbaru. Kombinasi diesel dan bensin, transmisi 8AT, 4WD part-time.",
    highlights: ["2.0T / 2.0D Engine", "8AT Transmission", "4WD Part-Time", "380 N·m Torque"],
    spesifikasi: {
      dimensi: "4630 × 1925 × 1871 mm",
      wheelbase: "2745 mm",
      mesin: "2.0T Gasoline / 2.0D Diesel",
      tenaga: "165 kW (2.0T) / 120 kW (2.0D)",
      torsi: "380 N·m",
      transmisi: "8AT"
    },
    gambar_url: "/models/bj40plus.jpg",
    urutan: 1
  },
  {
    id: "bj30hev-awd",
    nama: "BJ30 HEV AWD",
    variant: "HEV + Roof Tent",
    warna: "Matte Grey",
    tagline: "Hybrid Power, Off-Road Soul",
    deskripsi: "HEV AWD dengan roof tent — siap untuk eksplorasi tanpa batas. Magic Core Hybrid Drive dengan 11+ mode berkendara.",
    highlights: ["1.5T + Dual Motor", "AWD System", "11+ Drive Modes", "Roof Tent Ready"],
    spesifikasi: {
      dimensi: "4730 × 1910 × 1790 mm",
      wheelbase: "2820 mm",
      mesin: "1.5T + Dual Motor HEV",
      tenaga: "115 + 130 + 55 kW",
      torsi: "230 + 315 + 145 N·m",
      transmisi: "DHT"
    },
    gambar_url: "/models/bj30hev-awd.jpg",
    urutan: 2
  },
  {
    id: "bj30hev-fwd",
    nama: "BJ30 HEV FWD",
    variant: "HEV + Rear Box",
    warna: "Apple Green",
    tagline: "Smart Hybrid for Modern Life",
    deskripsi: "HEV FWD dengan rear box transparan. Efisien, cerdas, dan siap untuk segala kondisi jalan Indonesia.",
    highlights: ["1.5T + Single Motor", "FWD System", "220V In-Car Power", "1496L Cargo Space"],
    spesifikasi: {
      dimensi: "4730 × 1910 × 1790 mm",
      wheelbase: "2820 mm",
      mesin: "1.5T + Single Motor HEV",
      tenaga: "115 + 130 kW",
      torsi: "230 + 315 N·m",
      transmisi: "2DHT"
    },
    gambar_url: "/models/bj30hev-fwd.jpg",
    urutan: 3
  },
  {
    id: "x55ii",
    nama: "X55 II Prime",
    variant: "Prime — Black",
    warna: "Midnight Black",
    tagline: "Premium Everyday Companion",
    deskripsi: "SUV urban premium dengan VGT engine, 99.9% antibacterial cabin, dan first-class seat experience.",
    highlights: ["1.5T VGT Engine", "99.9% Antibacterial", "First-Class Seats", "Advanced ADAS"],
    spesifikasi: {
      dimensi: "4620 × 1836 × 1680 mm",
      wheelbase: "2735 mm",
      mesin: "1.5T VGT",
      tenaga: "138–150 kW",
      torsi: "305 N·m",
      transmisi: "7DCT"
    },
    gambar_url: "/models/x55ii.jpg",
    urutan: 4
  }
]
```

---

## 15. BOOKING CODE GENERATOR

```typescript
// lib/booking-utils.ts

export function generateBookingCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // exclude confusing chars: 0,O,1,I
  let code = "BTC-"
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code  // e.g.: BTC-A3K9XZ
}

export function normalizeWANumber(input: string): string {
  let num = input.replace(/\D/g, "")
  if (num.startsWith("0")) num = "62" + num.slice(1)
  if (num.startsWith("62")) return num
  return "62" + num
}

export function formatTanggal(date: string): string {
  // "2026-07-30" → "Kamis, 30 Juli 2026"
  return new Date(date).toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  })
}
```

---

## 16. WA MESSAGE TEMPLATES

```typescript
// lib/fonnte.ts — message templates

export function templateKonfirmasi(data: {
  nama: string
  model_nama: string
  tanggal: string    // "Kamis, 30 Juli 2026"
  slot_waktu: string // "14:00"
  booking_code: string
}): string {
  return `Halo ${data.nama},

Booking Test Drive BAIC Anda telah *DIKONFIRMASI* ✅

*Detail Booking:*
🚗 Unit     : ${data.model_nama}
📅 Tanggal  : ${data.tanggal}
⏰ Waktu    : ${data.slot_waktu} WIB
📍 Lokasi   : Booth BAIC, ICE BSD Tangerang
🎫 Kode     : *${data.booking_code}*

Kami akan mengingatkan Anda 15 menit sebelum waktu test drive dimulai.

Sampai jumpa di GIIAS 2026! 🙌
— _Tim BAIC Indonesia_`
}

export function templateReminder(data: {
  nama: string
  model_nama: string
  slot_waktu: string
  booking_code: string
}): string {
  return `Halo ${data.nama}! 👋

Test drive Anda dimulai dalam *15 menit!*

🚗 Unit  : ${data.model_nama}
⏰ Waktu : *${data.slot_waktu} WIB — HARI INI*

Silakan menuju area test drive BAIC sekarang.
Tunjukkan kode: *${data.booking_code}*

We'll see you soon! ✨
— _BAIC GIIAS 2026_`
}
```

---

## 17. DEVELOPMENT PRIORITY ORDER

Urutan pengerjaan yang direkomendasikan untuk mencapai working demo:

```
PHASE 1 — CORE BOOKING FLOW (prioritas demo 19 Mei)
  [x] Setup Next.js + Supabase + Tailwind
  [ ] Database schema migration (tabel bookings, car_models, blocked_slots)
  [ ] Seed car_models data
  [ ] Landing page
  [ ] /booking — Step 1: Model picker
  [ ] /booking/form — Step 2+3: Slot picker + form data
  [ ] /booking/confirm — Step 4: Confirmation + booking code
  [ ] /api/booking/create — dengan Fonnte mock
  [ ] /api/slots/availability

PHASE 2 — NOTIFICATIONS (segera setelah Fonnte token ready)
  [ ] Integrasi Fonnte di /api/booking/create (WA konfirmasi)
  [ ] /api/cron/send-reminders + vercel.json
  [ ] /api/notify/reminder

PHASE 3 — DASHBOARD (post-pitch)
  [ ] Supabase Auth setup
  [ ] /dashboard/overview
  [ ] /dashboard/bookings
  [ ] /dashboard/slots

PHASE 4 — POLISH
  [ ] /booking/check (cek status by booking code / no WA)
  [ ] Export CSV dashboard
  [ ] Walk-in input manual
  [ ] Real-time updates (Supabase Realtime subscription)
```

---

## 18. NOTES UNTUK CLAUDE CODE SESSION

1. **Fonnte mock mode:** Jika `FONNTE_TOKEN` tidak ada di `.env.local`, fungsi `sendWhatsApp()` harus log ke console dan return `{ success: true }` — jangan throw error. Demo harus tetap jalan tanpa token.

2. **Slot availability check harus atomic:** Saat create booking, gunakan Supabase transaction atau `select for update` untuk hindari race condition (dua orang booking slot yang sama bersamaan).

3. **Tanggal GIIAS hardcoded di constants.ts:** Calendar picker di frontend harus disable semua tanggal di luar range 30 Jul – 9 Agt 2026.

4. **Mobile-first adalah non-negotiable:** Semua komponen harus didesain untuk 390px dulu, baru responsive ke atas. Target customer premium menggunakan flagship phone.

5. **Booking code display:** Gunakan font monospace (`JetBrains Mono`) untuk booking code agar mudah dibaca dan premium.

6. **Image placeholder:** Jika gambar unit belum tersedia, gunakan solid color placeholder yang sesuai warna unit (Black → #1A1A1A, Apple Green → #4A7C59, dll).

7. **Supabase project:** Gunakan akun terpisah jika sudah hit free tier limit (2 project cap). Buat project baru dengan nama `baic-testdrive-2026`.

---

*BLUEPRINT ini adalah dokumen hidup. Update setiap ada perubahan requirement dari klien BAIC.*
*Watermark Indonesia — Confidential*
