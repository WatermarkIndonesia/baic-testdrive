import { CarModel } from "@/types"

export const GIIAS_START_DATE = "2026-07-30"
export const GIIAS_END_DATE = "2026-08-09"
export const OPERATING_HOURS_START = "10:00"
export const OPERATING_HOURS_END = "20:00"
export const SLOT_DURATION_MINUTES = 30
export const REMINDER_MINUTES_BEFORE = 15

export function generateSlots(): string[] {
  const slots: string[] = []
  let hour = 10, minute = 0
  while (hour < 20) {
    slots.push(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`)
    minute += 30
    if (minute >= 60) { minute = 0; hour++ }
  }
  return slots
}

export const GIIAS_DATES: string[] = (() => {
  const dates: string[] = []
  const start = new Date(GIIAS_START_DATE)
  const end = new Date(GIIAS_END_DATE)
  const cur = new Date(start)
  while (cur <= end) {
    dates.push(cur.toISOString().slice(0, 10))
    cur.setDate(cur.getDate() + 1)
  }
  return dates
})()

export const CAR_MODELS: CarModel[] = [
  {
    id: "bj40plus",
    nama: "BJ40 Plus",
    variant: "CKD",
    warna: "Phantom Black",
    tagline: "Born for the Untamed",
    deskripsi: "SUV off-road legendaris dengan powertrain terbaru. Kombinasi diesel dan bensin, transmisi 8AT, 4WD part-time.",
    highlights: ["2.0T / 2.0D Engine", "8AT Transmission", "4WD Part-Time", "380 N·m Torque"],
    spesifikasi: {
      Dimensi: "4630 × 1925 × 1871 mm",
      Wheelbase: "2745 mm",
      Mesin: "2.0T Gasoline / 2.0D Diesel",
      Tenaga: "165 kW (2.0T) / 120 kW (2.0D)",
      Torsi: "380 N·m",
      Transmisi: "8AT",
    },
    gambar_url: "/models/bj40plus.jpg",
    urutan: 1,
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
      Dimensi: "4730 × 1910 × 1790 mm",
      Wheelbase: "2820 mm",
      Mesin: "1.5T + Dual Motor HEV",
      Tenaga: "115 + 130 + 55 kW",
      Torsi: "230 + 315 + 145 N·m",
      Transmisi: "DHT",
    },
    gambar_url: "/models/bj30hev-awd.jpg",
    urutan: 2,
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
      Dimensi: "4730 × 1910 × 1790 mm",
      Wheelbase: "2820 mm",
      Mesin: "1.5T + Single Motor HEV",
      Tenaga: "115 + 130 kW",
      Torsi: "230 + 315 N·m",
      Transmisi: "2DHT",
    },
    gambar_url: "/models/bj30hev-fwd.jpg",
    urutan: 3,
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
      Dimensi: "4620 × 1836 × 1680 mm",
      Wheelbase: "2735 mm",
      Mesin: "1.5T VGT",
      Tenaga: "138–150 kW",
      Torsi: "305 N·m",
      Transmisi: "7DCT",
    },
    gambar_url: "/models/x55ii.jpg",
    urutan: 4,
  },
]

export const DOMISILI_OPTIONS = [
  "Jakarta Selatan", "Jakarta Barat", "Jakarta Pusat", "Jakarta Timur", "Jakarta Utara",
  "Tangerang", "Tangerang Selatan", "Bekasi", "Depok", "Bogor",
  "Bandung", "Surabaya", "Medan", "Semarang", "Yogyakarta",
  "Bali", "Makassar", "Palembang", "Balikpapan", "Lainnya",
]
