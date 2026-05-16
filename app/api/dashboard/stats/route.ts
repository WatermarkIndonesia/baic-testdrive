import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@/lib/supabase-server"
import { getAllDemoBookings } from "@/lib/demo-store"

const IS_DEMO = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")

export async function GET() {
  const cookieStore = await cookies()
  const session = cookieStore.get("dash_session")
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const today = new Date().toISOString().slice(0, 10)

  if (IS_DEMO) {
    const bookings = getAllDemoBookings()
    const total = bookings.length
    const todayCount = bookings.filter((b) => b.tanggal === today).length
    const upcoming = bookings.filter((b) => b.tanggal >= today && b.status !== "cancelled").length
    const modelMap: Record<string, string> = {
      "bj40plus": "BJ40 Plus", "bj30hev-awd": "BJ30 HEV AWD",
      "bj30hev-fwd": "BJ30 HEV FWD", "x55ii": "X55 II Prime",
    }
    const byModel: Record<string, number> = { "bj40plus": 0, "bj30hev-awd": 0, "bj30hev-fwd": 0, "x55ii": 0 }
    for (const b of bookings) {
      for (const [id, name] of Object.entries(modelMap)) {
        if (b.model_nama === name) byModel[id] = (byModel[id] ?? 0) + 1
      }
    }
    return NextResponse.json({ total, today: todayCount, upcoming, byModel })
  }

  try {
    const supabase = createServerClient()

    const { data: all } = await supabase
      .from("bookings")
      .select("model_id, tanggal, status")

    const bookings = all ?? []
    const total = bookings.length
    const todayCount = bookings.filter((b) => b.tanggal === today).length
    const upcoming = bookings.filter((b) => b.tanggal >= today && b.status !== "cancelled").length

    const byModel: Record<string, number> = { "bj40plus": 0, "bj30hev-awd": 0, "bj30hev-fwd": 0, "x55ii": 0 }
    for (const b of bookings) {
      if (b.model_id in byModel) byModel[b.model_id]++
    }

    return NextResponse.json({ total, today: todayCount, upcoming, byModel })
  } catch (err) {
    console.error("dashboard stats error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
