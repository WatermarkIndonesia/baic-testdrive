export type BookingStatus = 'confirmed' | 'reminded' | 'completed' | 'cancelled' | 'no_show'

export type CarModelId = 'bj40plus' | 'bj30hev-awd' | 'bj30hev-fwd' | 'x55ii'

export interface CarModel {
  id: CarModelId
  nama: string
  variant: string
  warna: string
  tagline: string
  deskripsi: string
  highlights: string[]
  spesifikasi: Record<string, string>
  gambar_url: string
  urutan: number
}

export interface Booking {
  id: string
  booking_code: string
  nama: string
  nomor_wa: string
  domisili: string
  kendaraan_saat_ini: string
  model_id: CarModelId
  model_nama: string
  tanggal: string
  slot_waktu: string
  status: BookingStatus
  reminder_sent: boolean
  reminder_sent_at?: string
  created_at: string
  updated_at: string
  source: string
}

export interface SlotAvailability {
  waktu: string
  available: boolean
  sisa: number
}

export interface CreateBookingRequest {
  nama: string
  nomor_wa: string
  domisili: string
  kendaraan_saat_ini: string
  model_id: CarModelId
  tanggal: string
  slot_waktu: string
}

export interface CreateBookingResponse {
  success: boolean
  booking_code?: string
  detail?: Partial<Booking>
  error?: string
  message?: string
}

export interface BookingFormState {
  model_id: CarModelId | null
  tanggal: string
  slot_waktu: string
  nama: string
  nomor_wa: string
  domisili: string
  kendaraan_saat_ini: string
}
