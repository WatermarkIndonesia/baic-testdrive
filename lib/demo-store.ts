// In-memory store for demo mode bookings (no Supabase)
// Uses globalThis so the Map is shared across Next.js per-route bundles

interface DemoBooking {
  booking_code: string
  nama: string
  nomor_wa: string
  domisili: string
  kendaraan_saat_ini: string
  model_nama: string
  tanggal: string
  slot_waktu: string
  status: string
}

const g = globalThis as typeof globalThis & { _demoStore?: Map<string, DemoBooking> }
if (!g._demoStore) g._demoStore = new Map()
const store = g._demoStore

export function saveDemoBooking(b: DemoBooking) {
  store.set(b.booking_code, b)
}

export function getDemoBooking(code: string): DemoBooking | undefined {
  return store.get(code)
}

export function getAllDemoBookings(): DemoBooking[] {
  return Array.from(store.values()).reverse()
}

export interface DemoBlockedSlot {
  id: string
  model_id: string
  tanggal: string
  slot_waktu: string
}

const gb = globalThis as typeof globalThis & { _blockedStore?: Map<string, DemoBlockedSlot> }
if (!gb._blockedStore) gb._blockedStore = new Map()
const blockedStore = gb._blockedStore

export function blockDemoSlot(s: DemoBlockedSlot): void {
  blockedStore.set(`${s.model_id}|${s.tanggal}|${s.slot_waktu}`, s)
}

export function unblockDemoSlot(id: string): void {
  blockedStore.forEach((val, key) => {
    if (val.id === id) {
      blockedStore.delete(key)
    }
  })
}

export function getDemoBlockedSlots(model_id?: string, tanggal?: string): DemoBlockedSlot[] {
  return Array.from(blockedStore.values()).filter((s) => {
    if (model_id && s.model_id !== model_id) return false
    if (tanggal && s.tanggal !== tanggal) return false
    return true
  })
}

function seedDemoData() {
  const seeds: DemoBooking[] = [
    { booking_code: "BAIC-SEED01", nama: "Budi Santoso", nomor_wa: "6281234567801", domisili: "Jakarta Selatan", kendaraan_saat_ini: "Toyota Fortuner", model_nama: "BJ40 Plus", tanggal: "2026-07-30", slot_waktu: "10:00", status: "confirmed" },
    { booking_code: "BAIC-SEED02", nama: "Siti Rahayu", nomor_wa: "6281234567802", domisili: "Tangerang Selatan", kendaraan_saat_ini: "Honda CR-V", model_nama: "BJ30 HEV AWD", tanggal: "2026-07-30", slot_waktu: "11:00", status: "confirmed" },
    { booking_code: "BAIC-SEED03", nama: "Ahmad Fauzi", nomor_wa: "6281234567803", domisili: "Bekasi", kendaraan_saat_ini: "Mitsubishi Pajero Sport", model_nama: "X55 II Prime", tanggal: "2026-07-31", slot_waktu: "10:30", status: "confirmed" },
    { booking_code: "BAIC-SEED04", nama: "Dewi Lestari", nomor_wa: "6281234567804", domisili: "Depok", kendaraan_saat_ini: "Suzuki Ertiga", model_nama: "BJ30 HEV FWD", tanggal: "2026-07-31", slot_waktu: "13:00", status: "confirmed" },
    { booking_code: "BAIC-SEED05", nama: "Eko Prasetyo", nomor_wa: "6281234567805", domisili: "Bogor", kendaraan_saat_ini: "Toyota Rush", model_nama: "BJ40 Plus", tanggal: "2026-08-01", slot_waktu: "14:00", status: "confirmed" },
    { booking_code: "BAIC-SEED06", nama: "Fitri Handayani", nomor_wa: "6281234567806", domisili: "Jakarta Barat", kendaraan_saat_ini: "Daihatsu Terios", model_nama: "BJ30 HEV AWD", tanggal: "2026-08-02", slot_waktu: "15:30", status: "confirmed" },
    { booking_code: "BAIC-SEED07", nama: "Gunawan Wibowo", nomor_wa: "6281234567807", domisili: "Jakarta Utara", kendaraan_saat_ini: "Honda HR-V", model_nama: "X55 II Prime", tanggal: "2026-08-03", slot_waktu: "16:00", status: "cancelled" },
    { booking_code: "BAIC-SEED08", nama: "Hana Pertiwi", nomor_wa: "6281234567808", domisili: "Tangerang", kendaraan_saat_ini: "Nissan X-Trail", model_nama: "BJ30 HEV FWD", tanggal: "2026-08-05", slot_waktu: "11:30", status: "confirmed" },
  ]
  for (const b of seeds) store.set(b.booking_code, b)
}

const gs = globalThis as typeof globalThis & { _demoSeeded?: boolean }
if (!gs._demoSeeded && store.size === 0) {
  seedDemoData()
  gs._demoSeeded = true
}
