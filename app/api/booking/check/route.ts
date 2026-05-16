import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase-server"
import { getDemoBooking } from "@/lib/demo-store"

const IS_DEMO = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code")?.trim().toUpperCase()

  if (!code) {
    return NextResponse.json({ error: "Booking code is required" }, { status: 400 })
  }

  // Demo mode: check in-memory store
  if (IS_DEMO) {
    const booking = getDemoBooking(code)
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }
    return NextResponse.json({
      booking_code: booking.booking_code,
      nama: booking.nama,
      model_nama: booking.model_nama,
      tanggal: booking.tanggal,
      slot_waktu: booking.slot_waktu,
      status: booking.status,
    })
  }

  // Production: check Supabase
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from("bookings")
      .select("booking_code, nama, model_nama, tanggal, slot_waktu, status")
      .eq("booking_code", code)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    return NextResponse.json({
      booking_code: data.booking_code,
      nama: data.nama,
      model_nama: data.model_nama,
      tanggal: data.tanggal,
      slot_waktu: data.slot_waktu?.slice(0, 5),
      status: data.status,
    })
  } catch (err) {
    console.error("booking check error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
