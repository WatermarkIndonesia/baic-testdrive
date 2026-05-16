"use client"

import { useEffect, useState, useCallback } from "react"

interface Booking {
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

const MODEL_OPTIONS = [
  { value: "", label: "All Models" },
  { value: "bj40plus", label: "BJ40 Plus" },
  { value: "bj30hev-awd", label: "BJ30 HEV AWD" },
  { value: "bj30hev-fwd", label: "BJ30 HEV FWD" },
  { value: "x55ii", label: "X55 II Prime" },
]

const PAGE_SIZE = 20

function StatusBadge({ status }: { status: string }) {
  if (status === "confirmed") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/15 text-green-400 border border-green-500/20">
        Confirmed
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/15 text-red-400 border border-red-500/20">
      Cancelled
    </span>
  )
}

function exportCSV(bookings: Booking[]) {
  const headers = ["Booking Code", "Name", "WhatsApp", "Domisili", "Kendaraan Saat Ini", "Model", "Date", "Time", "Status"]
  const rows = bookings.map((b) => [
    b.booking_code,
    b.nama,
    b.nomor_wa,
    b.domisili,
    b.kendaraan_saat_ini,
    b.model_nama,
    b.tanggal,
    b.slot_waktu,
    b.status,
  ])
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n")
  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `baic-bookings-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState("")
  const [modelId, setModelId] = useState("")
  const [tanggal, setTanggal] = useState("")
  const [page, setPage] = useState(0)

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (q) params.set("q", q)
    if (modelId) params.set("model_id", modelId)
    if (tanggal) params.set("tanggal", tanggal)
    try {
      const res = await fetch(`/api/dashboard/bookings?${params}`)
      const data = await res.json()
      setBookings(data.bookings ?? [])
      setPage(0)
    } finally {
      setLoading(false)
    }
  }, [q, modelId, tanggal])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const totalPages = Math.max(1, Math.ceil(bookings.length / PAGE_SIZE))
  const pageBookings = bookings.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const inputClass = "bg-[#1A1A27] border border-[#2A2A3E] text-white rounded-lg px-3 py-2 text-sm placeholder-[#4A4A5E] focus:outline-none focus:ring-1 focus:ring-[#4F8EF7] focus:border-[#4F8EF7] transition-colors"

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-white text-xl font-semibold">Leads</h1>
        <button
          onClick={() => exportCSV(bookings)}
          className="bg-[#1A1A27] border border-[#2A2A3E] hover:border-[#4F8EF7] text-[#9CA3AF] hover:text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Export CSV
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name or code…"
          className={`${inputClass} flex-1 min-w-[180px]`}
        />
        <select
          value={modelId}
          onChange={(e) => setModelId(e.target.value)}
          className={inputClass}
        >
          {MODEL_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} className="bg-[#1A1A27]">
              {o.label}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={tanggal}
          onChange={(e) => setTanggal(e.target.value)}
          className={inputClass}
        />
        {(q || modelId || tanggal) && (
          <button
            onClick={() => { setQ(""); setModelId(""); setTanggal("") }}
            className="text-[#9CA3AF] hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-[#1A1A27] transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <div className="bg-[#13131A] border border-[#1E1E2E] rounded-xl overflow-hidden">
        {loading ? (
          <div className="text-[#9CA3AF] text-sm text-center py-16">Loading…</div>
        ) : pageBookings.length === 0 ? (
          <div className="text-[#9CA3AF] text-sm text-center py-16">No bookings found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1E1E2E]">
                  {["Booking Code", "Name", "WhatsApp", "Domisili", "Kendaraan", "Model", "Date", "Time", "Status"].map((h) => (
                    <th key={h} className="text-left text-[#9CA3AF] text-xs uppercase tracking-wider px-4 py-3 font-medium whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageBookings.map((b, i) => (
                  <tr
                    key={b.booking_code}
                    className={`border-b border-[#1E1E2E]/50 hover:bg-[#1A1A27]/50 transition-colors ${i === pageBookings.length - 1 ? "border-b-0" : ""}`}
                  >
                    <td className="px-4 py-3 font-mono text-[#4F8EF7] text-xs whitespace-nowrap">{b.booking_code}</td>
                    <td className="px-4 py-3 text-white whitespace-nowrap">{b.nama}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <a
                        href={`https://wa.me/${b.nomor_wa}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[#9CA3AF] hover:text-[#25D366] transition-colors group"
                      >
                        <svg className="w-3.5 h-3.5 text-[#25D366] opacity-60 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        <span className="text-xs">{b.nomor_wa}</span>
                      </a>
                    </td>
                    <td className="px-4 py-3 text-[#9CA3AF] whitespace-nowrap">{b.domisili}</td>
                    <td className="px-4 py-3 text-[#9CA3AF] whitespace-nowrap">{b.kendaraan_saat_ini}</td>
                    <td className="px-4 py-3 text-[#9CA3AF] whitespace-nowrap">{b.model_nama}</td>
                    <td className="px-4 py-3 text-[#9CA3AF] whitespace-nowrap">{b.tanggal}</td>
                    <td className="px-4 py-3 text-[#9CA3AF] whitespace-nowrap">{b.slot_waktu}</td>
                    <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {bookings.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-[#9CA3AF] text-sm">
            {bookings.length} booking{bookings.length !== 1 ? "s" : ""} total
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="text-[#9CA3AF] disabled:opacity-30 hover:text-white text-sm px-3 py-1.5 rounded-lg hover:bg-[#1A1A27] transition-colors disabled:hover:bg-transparent"
              >
                Previous
              </button>
              <span className="text-[#9CA3AF] text-sm">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="text-[#9CA3AF] disabled:opacity-30 hover:text-white text-sm px-3 py-1.5 rounded-lg hover:bg-[#1A1A27] transition-colors disabled:hover:bg-transparent"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
