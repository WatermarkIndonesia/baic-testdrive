"use client"

import { useEffect, useState } from "react"
import { generateSlots, GIIAS_DATES } from "@/lib/constants"

interface BlockedSlot {
  id: string
  model_id: string
  tanggal: string
  slot_waktu: string
}

const SLOTS = generateSlots()

const MODEL_OPTIONS = [
  { value: "bj40plus", label: "BJ40 Plus" },
  { value: "bj30hev-awd", label: "BJ30 HEV AWD" },
  { value: "bj30hev-fwd", label: "BJ30 HEV FWD" },
  { value: "x55ii", label: "X55 II Prime" },
]

const MODEL_LABEL: Record<string, string> = {
  "bj40plus": "BJ40 Plus",
  "bj30hev-awd": "BJ30 HEV AWD",
  "bj30hev-fwd": "BJ30 HEV FWD",
  "x55ii": "X55 II Prime",
}

const inputClass = "w-full bg-[#1A1A27] border border-[#2A2A3E] text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4F8EF7] focus:border-[#4F8EF7] transition-colors"
const selectClass = `${inputClass} cursor-pointer`

export default function SlotsPage() {
  const [blocked, setBlocked] = useState<BlockedSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [blocking, setBlocking] = useState(false)

  const [modelId, setModelId] = useState(MODEL_OPTIONS[0].value)
  const [tanggal, setTanggal] = useState(GIIAS_DATES[0])
  const [slotWaktu, setSlotWaktu] = useState(SLOTS[0])
  const [formError, setFormError] = useState("")

  async function fetchBlocked() {
    setLoading(true)
    try {
      const res = await fetch("/api/dashboard/slots")
      const data = await res.json()
      setBlocked(data.slots ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlocked()
  }, [])

  async function handleBlock(e: React.FormEvent) {
    e.preventDefault()
    setFormError("")
    setBlocking(true)
    try {
      const res = await fetch("/api/dashboard/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model_id: modelId, tanggal, slot_waktu: slotWaktu }),
      })
      if (!res.ok) {
        const d = await res.json()
        setFormError(d.error ?? "Failed to block slot")
        return
      }
      await fetchBlocked()
    } catch {
      setFormError("Network error")
    } finally {
      setBlocking(false)
    }
  }

  async function handleUnblock(id: string) {
    await fetch(`/api/dashboard/slots?id=${id}`, { method: "DELETE" })
    await fetchBlocked()
  }

  return (
    <div>
      <h1 className="text-white text-xl font-semibold mb-6">Slot Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#13131A] border border-[#1E1E2E] rounded-xl p-5">
          <h2 className="text-white font-medium mb-4">Block a Slot</h2>
          <form onSubmit={handleBlock} className="space-y-4">
            <div>
              <label className="block text-[#9CA3AF] text-xs uppercase tracking-wider mb-1.5">
                Model
              </label>
              <select
                value={modelId}
                onChange={(e) => setModelId(e.target.value)}
                className={selectClass}
              >
                {MODEL_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} className="bg-[#1A1A27]">
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[#9CA3AF] text-xs uppercase tracking-wider mb-1.5">
                Date
              </label>
              <select
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className={selectClass}
              >
                {GIIAS_DATES.map((d) => (
                  <option key={d} value={d} className="bg-[#1A1A27]">
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[#9CA3AF] text-xs uppercase tracking-wider mb-1.5">
                Time Slot
              </label>
              <select
                value={slotWaktu}
                onChange={(e) => setSlotWaktu(e.target.value)}
                className={selectClass}
              >
                {SLOTS.map((s) => (
                  <option key={s} value={s} className="bg-[#1A1A27]">
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {formError && (
              <div className="text-[#EF4444] text-sm bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-lg px-3 py-2">
                {formError}
              </div>
            )}

            <button
              type="submit"
              disabled={blocking}
              className="w-full bg-[#4F8EF7] hover:bg-[#3B7BE8] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg px-4 py-2.5 text-sm transition-colors"
            >
              {blocking ? "Blocking…" : "Block Slot"}
            </button>
          </form>
        </div>

        <div className="bg-[#13131A] border border-[#1E1E2E] rounded-xl p-5">
          <h2 className="text-white font-medium mb-4">
            Blocked Slots
            {blocked.length > 0 && (
              <span className="ml-2 bg-[#4F8EF7]/15 text-[#4F8EF7] text-xs px-2 py-0.5 rounded-full">
                {blocked.length}
              </span>
            )}
          </h2>

          {loading ? (
            <div className="text-[#9CA3AF] text-sm text-center py-8">Loading…</div>
          ) : blocked.length === 0 ? (
            <div className="text-[#9CA3AF] text-sm text-center py-8">No blocked slots</div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {blocked.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between bg-[#1A1A27] border border-[#2A2A3E] rounded-lg px-3 py-2.5"
                >
                  <div>
                    <div className="text-white text-sm font-medium">
                      {MODEL_LABEL[s.model_id] ?? s.model_id}
                    </div>
                    <div className="text-[#9CA3AF] text-xs mt-0.5">
                      {s.tanggal} · {s.slot_waktu}
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnblock(s.id)}
                    className="text-[#EF4444] hover:text-red-300 text-xs px-2.5 py-1 rounded-lg bg-[#EF4444]/10 hover:bg-[#EF4444]/20 border border-[#EF4444]/20 transition-colors"
                  >
                    Unblock
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
