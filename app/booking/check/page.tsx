"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { formatTanggal } from "@/lib/booking-utils"

function statusBadge(status: string) {
  const map: Record<string, { label: string; color: string }> = {
    confirmed:  { label: "Confirmed",  color: "#4F8EF7" },
    reminded:   { label: "Reminded",   color: "#F59E0B" },
    completed:  { label: "Completed",  color: "#22C55E" },
    cancelled:  { label: "Cancelled",  color: "#EF4444" },
    no_show:    { label: "No Show",    color: "#8888AA" },
  }
  return map[status] ?? { label: status, color: "#8888AA" }
}

function CheckContent() {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Record<string, string> | null>(null)
  const [notFound, setNotFound] = useState(false)

  async function handleCheck() {
    if (!query.trim()) return
    setLoading(true)
    setResult(null)
    setNotFound(false)
    try {
      const res = await fetch(`/api/booking/check?code=${encodeURIComponent(query.trim().toUpperCase())}`)
      const data = await res.json()
      if (res.ok && data.booking_code) {
        setResult(data)
      } else {
        setNotFound(true)
      }
    } catch {
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0A0A0F] px-6 pt-12 pb-24">
      <div className="max-w-sm mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-[#8888AA] hover:text-[#F0F0F5] text-sm mb-8 transition-colors">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Home
        </Link>

        <h1 className="text-[#F0F0F5] font-semibold text-xl mb-1">Check Booking</h1>
        <p className="text-[#8888AA] text-sm mb-8">Enter your booking code (BTC-XXXXXX)</p>

        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleCheck()}
            placeholder="BTC-XXXXXX"
            maxLength={10}
            className="flex-1 bg-[#12121A] border border-[#1E1E2E] rounded-xl px-4 py-3 text-[#F0F0F5] text-sm tracking-widest placeholder-[#8888AA]/40 focus:outline-none focus:border-[#4F8EF7] uppercase transition-colors"
            style={{ fontFamily: '"JetBrains Mono", monospace' }}
          />
          <button
            onClick={handleCheck}
            disabled={loading || !query.trim()}
            className="bg-[#4F8EF7] hover:bg-[#3a7aef] disabled:bg-[#1E1E2E] disabled:text-[#8888AA] text-white font-semibold px-5 py-3 rounded-xl text-sm transition-colors"
          >
            {loading ? "..." : "Check"}
          </button>
        </div>

        {notFound && (
          <div className="mt-6 p-4 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-2xl">
            <p className="text-[#EF4444] text-sm font-medium">Booking not found</p>
            <p className="text-[#8888AA] text-xs mt-1">Please check your code and try again (format: BTC-XXXXXX)</p>
          </div>
        )}

        {result && (
          <div className="mt-6 bg-[#12121A] border border-[#1E1E2E] rounded-2xl overflow-hidden">
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div
                  className="text-lg font-bold tracking-[0.12em] text-[#4F8EF7]"
                  style={{ fontFamily: '"JetBrains Mono", monospace' }}
                >
                  {result.booking_code}
                </div>
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full border"
                  style={{
                    color: statusBadge(result.status).color,
                    borderColor: statusBadge(result.status).color + "40",
                    background: statusBadge(result.status).color + "10",
                  }}
                >
                  {statusBadge(result.status).label}
                </span>
              </div>

              <div className="border-t border-[#1E1E2E]" />

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Name",  value: result.nama },
                  { label: "Model", value: result.model_nama },
                  { label: "Date",  value: formatTanggal(result.tanggal) },
                  { label: "Time",  value: `${result.slot_waktu} WIB` },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="text-[#8888AA] text-[10px] uppercase tracking-wider">{item.label}</div>
                    <div className="text-[#F0F0F5] text-xs font-medium mt-0.5 leading-snug">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default function CheckPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-[#8888AA] text-sm">Loading...</div>
      </div>
    }>
      <CheckContent />
    </Suspense>
  )
}
