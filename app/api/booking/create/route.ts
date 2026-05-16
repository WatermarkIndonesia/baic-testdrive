import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase-server"
import { generateBookingCode, normalizeWANumber, formatTanggal } from "@/lib/booking-utils"
import { sendWhatsApp, templateKonfirmasi } from "@/lib/fonnte"
import { CAR_MODELS, GIIAS_START_DATE, GIIAS_END_DATE, generateSlots } from "@/lib/constants"
import { CreateBookingRequest } from "@/types"
import { saveDemoBooking } from "@/lib/demo-store"

const VALID_SLOTS = new Set(generateSlots())

// Demo mode: runs without Supabase when URL is placeholder
const IS_DEMO = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")

export async function POST(req: NextRequest) {
  let body: CreateBookingRequest
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: "INVALID_JSON" }, { status: 400 })
  }

  const { nama, nomor_wa, domisili, kendaraan_saat_ini, model_id, tanggal, slot_waktu } = body

  if (!nama?.trim() || !nomor_wa || !domisili || !kendaraan_saat_ini?.trim() || !model_id || !tanggal || !slot_waktu) {
    return NextResponse.json({ success: false, error: "MISSING_FIELDS", message: "All fields are required." }, { status: 400 })
  }

  const car = CAR_MODELS.find((c) => c.id === model_id)
  if (!car) {
    return NextResponse.json({ success: false, error: "INVALID_MODEL" }, { status: 400 })
  }

  if (tanggal < GIIAS_START_DATE || tanggal > GIIAS_END_DATE) {
    return NextResponse.json({ success: false, error: "INVALID_DATE", message: "Date is outside GIIAS 2026 range." }, { status: 400 })
  }

  if (!VALID_SLOTS.has(slot_waktu)) {
    return NextResponse.json({ success: false, error: "INVALID_SLOT" }, { status: 400 })
  }

  const wa = normalizeWANumber(nomor_wa)
  const booking_code = generateBookingCode()

  // --- DEMO MODE: skip DB, still send WA ---
  if (IS_DEMO) {
    console.log("[DEMO] Booking created (no DB):", { booking_code, nama, model_id, tanggal, slot_waktu })

    saveDemoBooking({
      booking_code,
      nama: nama.trim(),
      nomor_wa: wa,
      domisili,
      kendaraan_saat_ini: kendaraan_saat_ini.trim(),
      model_nama: car.nama,
      tanggal,
      slot_waktu,
      status: "confirmed",
    })

    sendWhatsApp(wa, templateKonfirmasi({
      nama: nama.trim(),
      model_nama: car.nama,
      tanggal: formatTanggal(tanggal),
      slot_waktu,
      booking_code,
    })).catch((e) => console.error("WA send failed:", e))

    return NextResponse.json({
      success: true,
      booking_code,
      detail: {
        booking_code,
        nama: nama.trim(),
        nomor_wa: wa,
        domisili,
        kendaraan_saat_ini: kendaraan_saat_ini.trim(),
        model_id,
        model_nama: car.nama,
        tanggal,
        slot_waktu,
        status: "confirmed",
        source: "microsite-demo",
      },
    })
  }

  // --- PRODUCTION MODE: use Supabase ---
  try {
    const supabase = createServerClient()

    const { count: bookedCount } = await supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("model_id", model_id)
      .eq("tanggal", tanggal)
      .eq("slot_waktu", slot_waktu + ":00")
      .not("status", "eq", "cancelled")

    if ((bookedCount ?? 0) > 0) {
      return NextResponse.json({
        success: false,
        error: "SLOT_UNAVAILABLE",
        message: "This slot is fully booked. Please choose another time.",
      }, { status: 409 })
    }

    const { count: blockedCount } = await supabase
      .from("blocked_slots")
      .select("id", { count: "exact", head: true })
      .eq("model_id", model_id)
      .eq("tanggal", tanggal)
      .eq("slot_waktu", slot_waktu + ":00")

    if ((blockedCount ?? 0) > 0) {
      return NextResponse.json({
        success: false,
        error: "SLOT_UNAVAILABLE",
        message: "This slot is unavailable. Please choose another time.",
      }, { status: 409 })
    }

    const { data: booking, error: insertError } = await supabase
      .from("bookings")
      .insert({
        booking_code,
        nama: nama.trim(),
        nomor_wa: wa,
        domisili,
        kendaraan_saat_ini: kendaraan_saat_ini.trim(),
        model_id,
        model_nama: car.nama,
        tanggal,
        slot_waktu: slot_waktu + ":00",
        status: "confirmed",
        source: "microsite",
      })
      .select()
      .single()

    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json({
          success: false,
          error: "SLOT_UNAVAILABLE",
          message: "This slot was just taken. Please choose another time.",
        }, { status: 409 })
      }
      throw insertError
    }

    sendWhatsApp(wa, templateKonfirmasi({
      nama: nama.trim(),
      model_nama: car.nama,
      tanggal: formatTanggal(tanggal),
      slot_waktu,
      booking_code,
    })).catch((e) => console.error("WA send failed:", e))

    return NextResponse.json({ success: true, booking_code, detail: booking })
  } catch (err) {
    console.error("booking create error:", err)
    return NextResponse.json({ success: false, error: "SERVER_ERROR", message: "Something went wrong. Please try again." }, { status: 500 })
  }
}
