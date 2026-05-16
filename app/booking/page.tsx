"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { CAR_MODELS } from "@/lib/constants"
import { CarModel } from "@/types"

export default function BookingPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  function handleSelect(car: CarModel) {
    setSelected(car.id)
  }

  function handleLanjut() {
    if (!selected) return
    router.push(`/booking/form?model=${selected}`)
  }

  return (
    <main className="min-h-screen bg-[#0A0A0F] pb-32">
      {/* Header */}
      <header className="flex items-center gap-4 px-6 py-4 border-b border-[#1E1E2E] bg-[#0A0A0F]">
        <Link href="/" className="p-2 -ml-2 text-[#8888AA] hover:text-[#F0F0F5] transition-colors">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
        <div>
          <h1 className="text-[#F0F0F5] font-semibold text-base">Reserve a Test Drive</h1>
          <p className="text-[#8888AA] text-xs">GIIAS 2026 · ICE BSD</p>
        </div>
      </header>

      {/* Progress */}
      <div className="px-6 pt-5 pb-4">
        <div className="flex items-center gap-2 mb-4">
          {["Select Model", "Date & Slot", "Your Details"].map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div className={`flex items-center gap-1.5 ${i === 0 ? "text-[#4F8EF7]" : "text-[#8888AA]"}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                  i === 0 ? "bg-[#4F8EF7] text-white" : "bg-[#1E1E2E] text-[#8888AA]"
                }`}>
                  {i + 1}
                </div>
                <span className="text-[11px] font-medium whitespace-nowrap hidden sm:block">{label}</span>
              </div>
              {i < 2 && <div className="flex-1 h-px bg-[#1E1E2E]" />}
            </div>
          ))}
        </div>
        <p className="text-[#F0F0F5] font-semibold text-base">Choose Your Model</p>
        <p className="text-[#8888AA] text-xs mt-0.5">Tap to explore, tap again to select</p>
      </div>

      {/* Car list */}
      <div className="px-6 space-y-3">
        {CAR_MODELS.map((car) => {
          const isSelected = selected === car.id
          const isExpanded = expanded === car.id

          return (
            <div
              key={car.id}
              className={`bg-[#12121A] border rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "border-[#4F8EF7] shadow-lg shadow-[#4F8EF7]/10"
                  : "border-[#1E1E2E] hover:border-[#4F8EF7]/30"
              }`}
              onClick={() => {
                if (isExpanded) {
                  handleSelect(car)
                } else {
                  setExpanded(isExpanded ? null : car.id)
                }
              }}
            >
              {/* Car header */}
              <div className="flex items-center gap-4 p-4">
                <div className="relative w-16 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-[#0A0A0F]">
                  <Image
                    src={car.gambar_url}
                    alt={car.nama}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-[#F0F0F5] font-semibold text-sm">{car.nama}</div>
                  <div className="text-[#8888AA] text-xs mt-0.5">{car.variant} · {car.warna}</div>
                  <div className="text-[#4F8EF7] text-xs mt-1 italic">{car.tagline}</div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-[#4F8EF7] flex items-center justify-center">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                  <svg
                    width="16" height="16" viewBox="0 0 16 16" fill="none"
                    className={`text-[#8888AA] transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                  >
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="border-t border-[#1E1E2E]" onClick={(e) => e.stopPropagation()}>
                  {/* Hero image */}
                  <div className="relative w-full aspect-video bg-[#0A0A0F]">
                    <Image
                      src={car.gambar_url}
                      alt={car.nama}
                      fill
                      className="object-cover"
                      sizes="100vw"
                    />
                  </div>

                  <div className="p-4">
                    <p className="text-[#8888AA] text-xs leading-relaxed">{car.deskripsi}</p>

                    {/* Highlights */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {car.highlights.map((h) => (
                        <span key={h} className="bg-[#4F8EF7]/10 text-[#4F8EF7] text-[10px] font-medium px-2.5 py-1 rounded-full border border-[#4F8EF7]/20">
                          {h}
                        </span>
                      ))}
                    </div>

                    {/* Specs */}
                    <div className="mt-3 grid grid-cols-2 gap-1.5">
                      {Object.entries(car.spesifikasi).map(([key, val]) => (
                        <div key={key} className="bg-[#0A0A0F] rounded-xl p-2.5">
                          <div className="text-[#8888AA] text-[9px] uppercase tracking-wider">{key}</div>
                          <div className="text-[#F0F0F5] text-[11px] font-medium mt-0.5">{val}</div>
                        </div>
                      ))}
                    </div>

                    {/* Select button */}
                    <button
                      onClick={() => handleSelect(car)}
                      className={`w-full mt-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                        isSelected
                          ? "bg-[#4F8EF7] text-white"
                          : "bg-[#4F8EF7]/10 text-[#4F8EF7] border border-[#4F8EF7]/30 hover:bg-[#4F8EF7]/20"
                      }`}
                    >
                      {isSelected ? "✓ Model Selected" : "Select This Model"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0A0A0F] to-transparent pointer-events-none">
        <button
          onClick={handleLanjut}
          disabled={!selected}
          className={`w-full max-w-xl mx-auto flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-base transition-all duration-200 pointer-events-auto ${
            selected
              ? "bg-[#4F8EF7] text-white shadow-lg shadow-[#4F8EF7]/20 hover:bg-[#3a7aef]"
              : "bg-[#1E1E2E] text-[#8888AA] cursor-not-allowed"
          }`}
        >
          {selected ? (
            <>
              Continue to Date & Time
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </>
          ) : (
            "Select a model to continue"
          )}
        </button>
      </div>
    </main>
  )
}
