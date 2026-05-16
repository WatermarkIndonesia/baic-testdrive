"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { CAR_MODELS, GIIAS_DATES, generateSlots, DOMISILI_OPTIONS } from "@/lib/constants"
import { normalizeWANumber, formatTanggal } from "@/lib/booking-utils"
import { SlotAvailability } from "@/types"

const ALL_SLOTS = generateSlots()

function FormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const modelId = searchParams.get("model")

  const car = CAR_MODELS.find((c) => c.id === modelId)

  const [step, setStep] = useState<"date" | "slot" | "form">("date")
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedSlot, setSelectedSlot] = useState<string>("")
  const [availability, setAvailability] = useState<SlotAvailability[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  // Form fields
  const [nama, setNama] = useState("")
  const [nomorWA, setNomorWA] = useState("")
  const [domisili, setDomisili] = useState("")
  const [kendaraan, setKendaraan] = useState("")
  const [setuju, setSetuju] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAvailability = useCallback(async (date: string) => {
    if (!modelId || !date) return
    setLoadingSlots(true)
    setAvailability([])
    try {
      const res = await fetch(`/api/slots/availability?model_id=${modelId}&tanggal=${date}`)
      const data = await res.json()
      setAvailability(data.slots || [])
    } catch {
      setAvailability(ALL_SLOTS.map((w) => ({ waktu: w, available: true, sisa: 1 })))
    } finally {
      setLoadingSlots(false)
    }
  }, [modelId, ALL_SLOTS])

  useEffect(() => {
    if (selectedDate) fetchAvailability(selectedDate)
  }, [selectedDate, fetchAvailability])

  if (!car) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#8888AA]">
        Unit tidak ditemukan.{" "}
        <Link href="/booking" className="text-[#4F8EF7] ml-1">Kembali</Link>
      </div>
    )
  }

  function getSlotStatus(waktu: string): SlotAvailability {
    const found = availability.find((a) => a.waktu === waktu)
    return found ?? { waktu, available: true, sisa: 1 }
  }

  async function handleSubmit() {
    if (!selectedDate || !selectedSlot || !nama.trim() || !nomorWA.trim() || !domisili || !kendaraan.trim() || !setuju) return
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/booking/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: nama.trim(),
          nomor_wa: normalizeWANumber(nomorWA),
          domisili,
          kendaraan_saat_ini: kendaraan.trim(),
          model_id: modelId,
          tanggal: selectedDate,
          slot_waktu: selectedSlot,
        }),
      })
      const data = await res.json()

      if (data.success) {
        router.push(`/booking/confirm?code=${data.booking_code}&model=${modelId}&tanggal=${selectedDate}&slot=${selectedSlot}&nama=${encodeURIComponent(nama.trim())}`)
      } else if (data.error === "SLOT_UNAVAILABLE") {
        setError("Slot ini sudah penuh. Silakan pilih waktu lain.")
        setStep("slot")
        setSelectedSlot("")
        fetchAvailability(selectedDate)
      } else {
        setError("Terjadi kesalahan. Silakan coba lagi.")
      }
    } catch {
      setError("Koneksi bermasalah. Silakan coba lagi.")
    } finally {
      setSubmitting(false)
    }
  }

  const stepIndex = step === "date" ? 0 : step === "slot" ? 1 : 2
  const progressSteps = ["Date", "Time Slot", "Details"]

  return (
    <main className="min-h-screen bg-[#0A0A0F] pb-32">
      {/* Header */}
      <header className="flex items-center gap-4 px-6 py-4 border-b border-[#1E1E2E] bg-[#0A0A0F]">
        <div className="w-full max-w-2xl mx-auto flex items-center gap-4">
        <button
          onClick={() => {
            if (step === "slot") setStep("date")
            else if (step === "form") setStep("slot")
            else router.push("/booking")
          }}
          className="p-2 -ml-2 text-[#8888AA] hover:text-[#F0F0F5] transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-[#F0F0F5] font-semibold text-base">
            {step === "date" ? "Select a Date" : step === "slot" ? "Choose a Time Slot" : "Your Details"}
          </h1>
          <p className="text-[#8888AA] text-xs">{car.nama} · {car.variant}</p>
        </div>
        </div>
      </header>

      {/* Progress */}
      <div className="px-6 pt-5 pb-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            {[...progressSteps].map((label, i) => (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div className={`flex items-center gap-1.5 ${i <= stepIndex ? "text-[#4F8EF7]" : "text-[#8888AA]"}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                    i < stepIndex ? "bg-[#4F8EF7] text-white" :
                    i === stepIndex ? "bg-[#4F8EF7] text-white" :
                    "bg-[#1E1E2E] text-[#8888AA]"
                  }`}>
                    {i < stepIndex ? (
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M1.5 4l1.5 1.5 3.5-3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : i + 2}
                  </div>
                  <span className="text-[11px] font-medium hidden sm:block">{label}</span>
                </div>
                {i < 2 && <div className={`flex-1 h-px ${i < stepIndex ? "bg-[#4F8EF7]" : "bg-[#1E1E2E]"}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-6 mb-4 max-w-2xl mx-auto p-3 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl text-[#EF4444] text-sm">
          {error}
        </div>
      )}

      {/* Step: Date */}
      {step === "date" && (
        <div className="px-6 max-w-2xl mx-auto">
          <p className="text-[#8888AA] text-xs mb-4">Select your visit date at GIIAS 2026</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {GIIAS_DATES.map((date) => {
              const d = new Date(date + "T00:00:00")
              const day = d.toLocaleDateString("id-ID", { weekday: "short" })
              const num = d.getDate()
              const mon = d.toLocaleDateString("id-ID", { month: "short" })
              const isSelected = selectedDate === date

              return (
                <button
                  key={date}
                  onClick={() => { setSelectedDate(date); setSelectedSlot(""); setStep("slot") }}
                  className={`flex flex-col items-center py-3 px-2 rounded-xl border transition-all duration-150 ${
                    isSelected
                      ? "border-[#4F8EF7] bg-[#4F8EF7]/10 text-[#4F8EF7]"
                      : "border-[#1E1E2E] bg-[#12121A] text-[#F0F0F5] hover:border-[#4F8EF7]/40"
                  }`}
                >
                  <span className="text-[10px] text-[#8888AA] uppercase">{day}</span>
                  <span className="text-lg font-bold mt-0.5">{num}</span>
                  <span className="text-[10px] text-[#8888AA]">{mon}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Step: Slot */}
      {step === "slot" && (
        <div className="px-6 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[#8888AA] text-xs">Select an available time slot</p>
            <button onClick={() => setStep("date")} className="text-[#4F8EF7] text-xs underline">
              Change date
            </button>
          </div>
          <p className="text-[#F0F0F5] text-sm font-medium mb-4">{formatTanggal(selectedDate)}</p>

          {/* Legend */}
          <div className="flex items-center gap-4 mb-4 text-[10px] text-[#8888AA]">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#22C55E]/20 border border-[#22C55E]/40" />Available</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#1E1E2E]" />Full</span>
          </div>

          {loadingSlots ? (
            <div className="grid grid-cols-4 gap-2">
              {Array(20).fill(0).map((_, i) => (
                <div key={i} className="h-12 bg-[#12121A] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {ALL_SLOTS.map((waktu) => {
                const status = getSlotStatus(waktu)
                const isSelected = selectedSlot === waktu
                const isAvailable = status.available

                return (
                  <button
                    key={waktu}
                    disabled={!isAvailable}
                    onClick={() => setSelectedSlot(waktu)}
                    className={`py-3 rounded-xl border text-sm font-medium transition-all duration-150 min-h-[48px] ${
                      isSelected
                        ? "border-[#4F8EF7] bg-[#4F8EF7] text-white shadow-md shadow-[#4F8EF7]/20"
                        : isAvailable
                        ? "border-[#22C55E]/40 bg-[#22C55E]/5 text-[#22C55E] hover:bg-[#22C55E]/10"
                        : "border-[#1E1E2E] bg-[#12121A] text-[#8888AA]/40 cursor-not-allowed"
                    }`}
                  >
                    {waktu}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Step: Form */}
      {step === "form" && (
        <div className="px-6 space-y-4 max-w-2xl mx-auto">
          {/* Summary pill */}
          <div className="bg-[#12121A] border border-[#1E1E2E] rounded-2xl p-4 flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-[#0A0A0F]">
              <Image src={car.gambar_url} alt={car.nama} fill className="object-cover" sizes="40px" />
            </div>
            <div>
              <div className="text-[#F0F0F5] text-sm font-semibold">{car.nama}</div>
              <div className="text-[#8888AA] text-xs">{formatTanggal(selectedDate)} · {selectedSlot} WIB</div>
            </div>
            <button onClick={() => setStep("slot")} className="ml-auto text-[#4F8EF7] text-xs">Change</button>
          </div>

          {/* Full name */}
          <div>
            <label className="block text-[#8888AA] text-xs font-medium mb-1.5 uppercase tracking-wider">Full Name</label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Enter your full name"
              className="w-full bg-[#12121A] border border-[#1E1E2E] rounded-xl px-4 py-3 text-[#F0F0F5] text-sm placeholder-[#8888AA]/50 focus:outline-none focus:border-[#4F8EF7] transition-colors"
            />
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-[#8888AA] text-xs font-medium mb-1.5 uppercase tracking-wider">WhatsApp Number</label>
            <div className="flex gap-2">
              <div className="flex items-center bg-[#12121A] border border-[#1E1E2E] rounded-xl px-3 text-[#8888AA] text-sm flex-shrink-0">
                +62
              </div>
              <input
                type="tel"
                value={nomorWA}
                onChange={(e) => setNomorWA(e.target.value)}
                placeholder="812 3456 7890"
                inputMode="numeric"
                className="flex-1 bg-[#12121A] border border-[#1E1E2E] rounded-xl px-4 py-3 text-[#F0F0F5] text-sm placeholder-[#8888AA]/50 focus:outline-none focus:border-[#4F8EF7] transition-colors"
              />
            </div>
          </div>

          {/* City */}
          <div>
            <label className="block text-[#8888AA] text-xs font-medium mb-1.5 uppercase tracking-wider">City of Residence</label>
            <select
              value={domisili}
              onChange={(e) => setDomisili(e.target.value)}
              className="w-full bg-[#12121A] border border-[#1E1E2E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#4F8EF7] transition-colors appearance-none"
              style={{ color: domisili ? "#F0F0F5" : "#8888AA80" }}
            >
              <option value="" disabled>Select your city</option>
              {DOMISILI_OPTIONS.map((d) => (
                <option key={d} value={d} style={{ color: "#F0F0F5", background: "#12121A" }}>{d}</option>
              ))}
            </select>
          </div>

          {/* Current vehicle */}
          <div>
            <label className="block text-[#8888AA] text-xs font-medium mb-1.5 uppercase tracking-wider">Current Vehicle</label>
            <input
              type="text"
              value={kendaraan}
              onChange={(e) => setKendaraan(e.target.value)}
              placeholder="e.g. Toyota Fortuner 2021"
              className="w-full bg-[#12121A] border border-[#1E1E2E] rounded-xl px-4 py-3 text-[#F0F0F5] text-sm placeholder-[#8888AA]/50 focus:outline-none focus:border-[#4F8EF7] transition-colors"
            />
          </div>

          {/* Consent */}
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <div
              onClick={() => setSetuju(!setuju)}
              className={`w-5 h-5 rounded flex-shrink-0 mt-0.5 border flex items-center justify-center transition-all ${
                setuju ? "bg-[#4F8EF7] border-[#4F8EF7]" : "bg-[#12121A] border-[#1E1E2E]"
              }`}
            >
              {setuju && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span className="text-[#8888AA] text-xs leading-relaxed">
              I agree to be contacted via WhatsApp for booking confirmation and test drive reminders at GIIAS 2026.
            </span>
          </label>
        </div>
      )}

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/90 to-transparent">
        <div className="max-w-xl mx-auto">
          {step === "slot" && selectedSlot && (
            <button
              onClick={() => setStep("form")}
              className="w-full flex items-center justify-center gap-2 bg-[#4F8EF7] text-white py-4 rounded-2xl font-semibold text-base shadow-lg shadow-[#4F8EF7]/20 hover:bg-[#3a7aef] transition-all"
            >
              Continue to Details
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}

          {step === "form" && (
            <button
              onClick={handleSubmit}
              disabled={!nama.trim() || !nomorWA.trim() || !domisili || !kendaraan.trim() || !setuju || submitting}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-base transition-all ${
                nama.trim() && nomorWA.trim() && domisili && kendaraan.trim() && setuju && !submitting
                  ? "bg-[#4F8EF7] text-white shadow-lg shadow-[#4F8EF7]/20 hover:bg-[#3a7aef]"
                  : "bg-[#1E1E2E] text-[#8888AA] cursor-not-allowed"
              }`}
            >
              {submitting ? (
                <>
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="20 10" />
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  Confirm Booking
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </main>
  )
}

export default function FormPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-[#8888AA] text-sm">Memuat...</div>
      </div>
    }>
      <FormContent />
    </Suspense>
  )
}
