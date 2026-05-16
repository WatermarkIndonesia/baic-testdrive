import { NextRequest, NextResponse } from "next/server"
import { sendWhatsApp, templateKonfirmasi, templateReminder } from "@/lib/fonnte"

// DEV-ONLY test endpoint — remove before production
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const nomor = searchParams.get("nomor") ?? ""
  const type = searchParams.get("type") ?? "konfirmasi"

  if (!nomor) {
    return NextResponse.json({ error: "nomor required" }, { status: 400 })
  }

  const sampleData = {
    nama: "David",
    model_nama: "BJ40 Plus",
    tanggal: "Thursday, 30 July 2026",
    slot_waktu: "14:00",
    booking_code: "BTC-A3K9XZ",
  }

  const pesan = type === "reminder"
    ? templateReminder(sampleData)
    : templateKonfirmasi(sampleData)

  const result = await sendWhatsApp(nomor, pesan)
  return NextResponse.json({ ...result, nomor, type, pesan })
}
