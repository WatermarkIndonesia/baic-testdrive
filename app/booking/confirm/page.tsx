"use client"

import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { CAR_MODELS } from "@/lib/constants"
import { formatTanggal } from "@/lib/booking-utils"

function ConfirmContent() {
  const params = useSearchParams()
  const code = params.get("code") ?? ""
  const modelId = params.get("model") ?? ""
  const tanggal = params.get("tanggal") ?? ""
  const slot = params.get("slot") ?? ""
  const nama = params.get("nama") ?? ""

  const car = CAR_MODELS.find((c) => c.id === modelId)

  const shareText = `My BAIC ARCFOX test drive at GIIAS 2026 is confirmed!\n\nModel: ${car?.nama ?? modelId}\nDate: ${formatTanggal(tanggal)}\nTime: ${slot} WIB\nCode: ${code}\n\nVenue: BAIC Booth — ICE BSD, Tangerang`

  function handleShareWA() {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank")
  }

  return (
    <main className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-start pt-12 pb-24 px-6">
      {/* Success icon */}
      <div className="w-16 h-16 rounded-2xl bg-[#22C55E]/10 border border-[#22C55E]/30 flex items-center justify-center mb-6">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M8 16l5 5 11-11" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <h1 className="text-[#F0F0F5] font-semibold text-xl text-center mb-1">You&rsquo;re all set.</h1>
      <p className="text-[#8888AA] text-sm text-center mb-8 max-w-xs leading-relaxed">
        A confirmation has been sent to your WhatsApp. Show this code when you arrive at the BAIC booth.
      </p>

      {/* Booking card */}
      <div className="w-full max-w-sm bg-[#12121A] border border-[#1E1E2E] rounded-2xl overflow-hidden">
        {/* Car image banner */}
        <div className="relative w-full h-28 bg-[#0A0A0F]">
          {car && (
            <Image
              src={car.gambar_url}
              alt={car.nama}
              fill
              className="object-cover opacity-80"
              sizes="384px"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0F]/80 to-transparent flex items-center px-5">
            <div>
              <div className="text-[#F0F0F5] font-semibold text-sm">{car?.nama ?? modelId}</div>
              <div className="text-[#8888AA] text-xs mt-0.5">{car?.variant}</div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Name", value: nama || "—" },
              { label: "Date", value: formatTanggal(tanggal) },
              { label: "Time", value: slot ? `${slot} WIB` : "—" },
              { label: "Venue", value: "BAIC Booth, ICE BSD" },
            ].map((item) => (
              <div key={item.label}>
                <div className="text-[#8888AA] text-[10px] uppercase tracking-wider">{item.label}</div>
                <div className="text-[#F0F0F5] text-xs font-medium mt-0.5 leading-snug">{item.value}</div>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-[#1E1E2E]" />

          {/* Booking code */}
          <div className="text-center">
            <div className="text-[#8888AA] text-[10px] uppercase tracking-wider mb-2">Booking Code</div>
            <div
              className="text-[#4F8EF7] text-2xl font-bold tracking-[0.15em]"
              style={{ fontFamily: '"JetBrains Mono", monospace' }}
            >
              {code}
            </div>
            <p className="text-[#8888AA] text-[10px] mt-1.5">Present this code to our team at the booth</p>
          </div>
        </div>
      </div>

      {/* Info box */}
      <div className="w-full max-w-sm mt-4 bg-[#4F8EF7]/5 border border-[#4F8EF7]/20 rounded-2xl p-4 flex gap-3">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 mt-0.5 text-[#4F8EF7]">
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M8 7v4M8 5.5v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
        <div>
          <p className="text-[#F0F0F5] text-xs font-medium">Automatic reminder</p>
          <p className="text-[#8888AA] text-xs mt-0.5 leading-relaxed">We&rsquo;ll send you a WhatsApp reminder 15 minutes before your session begins.</p>
        </div>
      </div>

      {/* Actions */}
      <div className="w-full max-w-sm mt-6 space-y-3">
        <button
          onClick={handleShareWA}
          className="w-full flex items-center justify-center gap-2 bg-[#22C55E] hover:bg-[#16a34a] text-white font-semibold py-4 rounded-2xl text-sm transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" className="opacity-90">
            <path d="M9 0C4.03 0 0 4.03 0 9c0 1.59.42 3.08 1.14 4.38L0 18l4.77-1.25A8.95 8.95 0 009 18c4.97 0 9-4.03 9-9s-4.03-9-9-9zm4.41 12.77c-.2.56-1.15 1.08-1.6 1.13-.42.05-.95.07-1.53-.1-.35-.1-.8-.25-1.37-.5-2.41-1.04-3.98-3.47-4.1-3.63-.12-.16-.96-1.28-.96-2.44 0-1.16.6-1.73.82-1.97.2-.24.45-.3.6-.3.15 0 .3 0 .43.01.14.01.32-.05.5.38.2.45.68 1.65.74 1.77.06.12.1.27.02.43-.08.16-.12.26-.24.4-.12.14-.25.3-.36.41-.12.12-.24.25-.1.5.14.24.62 1.02 1.33 1.65.92.8 1.69 1.05 1.93 1.17.24.12.38.1.52-.06.14-.16.6-.7.76-.94.16-.24.32-.2.54-.12.22.08 1.4.66 1.64.78.24.12.4.18.46.28.06.1.06.57-.14 1.13z"/>
          </svg>
          Share via WhatsApp
        </button>

        <Link
          href="/booking/check"
          className="w-full flex items-center justify-center bg-[#12121A] border border-[#1E1E2E] hover:border-[#4F8EF7]/40 text-[#F0F0F5] font-medium py-4 rounded-2xl text-sm transition-colors"
        >
          Check Booking Status
        </Link>

        <Link
          href="/"
          className="w-full flex items-center justify-center text-[#8888AA] text-sm py-3 hover:text-[#F0F0F5] transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </main>
  )
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-[#8888AA] text-sm">Loading...</div>
      </div>
    }>
      <ConfirmContent />
    </Suspense>
  )
}
