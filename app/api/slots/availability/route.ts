import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase-server"
import { generateSlots } from "@/lib/constants"
import { SlotAvailability } from "@/types"

const ALL_SLOTS = generateSlots()

const IS_DEMO = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const model_id = searchParams.get("model_id")
  const tanggal = searchParams.get("tanggal")

  if (!model_id || !tanggal) {
    return NextResponse.json({ error: "model_id dan tanggal wajib diisi" }, { status: 400 })
  }

  // Demo mode: all slots available
  if (IS_DEMO) {
    const slots: SlotAvailability[] = ALL_SLOTS.map((waktu) => ({ waktu, available: true, sisa: 1 }))
    return NextResponse.json({ slots }, { headers: { "Cache-Control": "no-store" } })
  }

  try {
    const supabase = createServerClient()

    const { data: bookings } = await supabase
      .from("bookings")
      .select("slot_waktu")
      .eq("model_id", model_id)
      .eq("tanggal", tanggal)
      .not("status", "eq", "cancelled")

    const { data: blocked } = await supabase
      .from("blocked_slots")
      .select("slot_waktu")
      .eq("model_id", model_id)
      .eq("tanggal", tanggal)

    const bookedTimes = new Set((bookings ?? []).map((b) => b.slot_waktu.slice(0, 5)))
    const blockedTimes = new Set((blocked ?? []).map((b) => b.slot_waktu.slice(0, 5)))

    const slots: SlotAvailability[] = ALL_SLOTS.map((waktu) => ({
      waktu,
      available: !bookedTimes.has(waktu) && !blockedTimes.has(waktu),
      sisa: bookedTimes.has(waktu) || blockedTimes.has(waktu) ? 0 : 1,
    }))

    return NextResponse.json({ slots }, { headers: { "Cache-Control": "no-store" } })
  } catch (err) {
    console.error("availability error:", err)
    const slots: SlotAvailability[] = ALL_SLOTS.map((waktu) => ({ waktu, available: true, sisa: 1 }))
    return NextResponse.json({ slots })
  }
}
