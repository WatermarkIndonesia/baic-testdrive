"use client"

import { useEffect, useState } from "react"

interface Stats {
  total: number
  today: number
  upcoming: number
  byModel: Record<string, number>
}

const MODEL_LABELS: Record<string, string> = {
  "bj40plus": "BJ40 Plus",
  "bj30hev-awd": "BJ30 HEV AWD",
  "bj30hev-fwd": "BJ30 HEV FWD",
  "x55ii": "X55 II Prime",
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-[#13131A] border border-[#1E1E2E] rounded-xl p-5">
      <div className="text-[#9CA3AF] text-xs uppercase tracking-wider mb-2">{label}</div>
      <div className="text-white text-2xl font-bold">{value}</div>
    </div>
  )
}

export default function OverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => setError("Failed to load stats"))
  }, [])

  const total = stats?.total ?? 0

  return (
    <div>
      <h1 className="text-white text-xl font-semibold mb-6">Overview</h1>

      {error && (
        <div className="text-[#EF4444] text-sm mb-4">{error}</div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Bookings" value={stats?.total ?? "—"} />
        <StatCard label="Today's Bookings" value={stats?.today ?? "—"} />
        <StatCard label="Upcoming" value={stats?.upcoming ?? "—"} />
        <StatCard label="Models" value={4} />
      </div>

      <div className="bg-[#13131A] border border-[#1E1E2E] rounded-xl p-5">
        <h2 className="text-white font-medium mb-5">Bookings by Model</h2>
        <div className="space-y-4">
          {Object.entries(MODEL_LABELS).map(([id, label]) => {
            const count = stats?.byModel?.[id] ?? 0
            const pct = total > 0 ? Math.round((count / total) * 100) : 0
            return (
              <div key={id}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-[#9CA3AF]">{label}</span>
                  <span className="text-white font-medium">{count}</span>
                </div>
                <div className="h-2 bg-[#1E1E2E] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#4F8EF7] rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
