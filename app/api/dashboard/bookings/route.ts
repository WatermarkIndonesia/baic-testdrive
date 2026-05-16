import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@/lib/supabase-server"
import { getAllDemoBookings } from "@/lib/demo-store"

const IS_DEMO = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")

async function checkAuth() {
  const cookieStore = await cookies()
  return cookieStore.get("dash_session")
}

export async function GET(req: NextRequest) {
  const session = await checkAuth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const model_id = searchParams.get("model_id") ?? ""
  const tanggal = searchParams.get("tanggal") ?? ""
  const q = searchParams.get("q") ?? ""

  if (IS_DEMO) {
    const modelMap: Record<string, string> = {
      "bj40plus": "BJ40 Plus",
      "bj30hev-awd": "BJ30 HEV AWD",
      "bj30hev-fwd": "BJ30 HEV FWD",
      "x55ii": "X55 II Prime",
    }
    let bookings = getAllDemoBookings()
    if (model_id && modelMap[model_id]) bookings = bookings.filter((b) => b.model_nama === modelMap[model_id])
    if (tanggal) bookings = bookings.filter((b) => b.tanggal === tanggal)
    if (q) {
      const lower = q.toLowerCase()
      bookings = bookings.filter((b) => b.nama.toLowerCase().includes(lower) || b.booking_code.toLowerCase().includes(lower))
    }
    return NextResponse.json({ bookings })
  }

  try {
    const supabase = createServerClient()
    let query = supabase
      .from("bookings")
      .select("booking_code, nama, nomor_wa, domisili, kendaraan_saat_ini, model_id, model_nama, tanggal, slot_waktu, status, created_at")
      .order("created_at", { ascending: false })

    if (model_id) query = query.eq("model_id", model_id)
    if (tanggal) query = query.eq("tanggal", tanggal)
    if (q) query = query.or(`nama.ilike.%${q}%,booking_code.ilike.%${q}%`)

    const { data, error } = await query
    if (error) throw error

    const bookings = (data ?? []).map((b) => ({
      ...b,
      slot_waktu: b.slot_waktu?.slice(0, 5),
    }))

    return NextResponse.json({ bookings })
  } catch (err) {
    console.error("dashboard bookings error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
