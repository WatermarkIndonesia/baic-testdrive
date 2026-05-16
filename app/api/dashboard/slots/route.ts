import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@/lib/supabase-server"
import { blockDemoSlot, unblockDemoSlot, getDemoBlockedSlots, DemoBlockedSlot } from "@/lib/demo-store"

const IS_DEMO = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")

function randomId() {
  return Math.random().toString(36).slice(2, 10)
}

async function checkAuth() {
  const cookieStore = await cookies()
  return cookieStore.get("dash_session")
}

export async function GET(req: NextRequest) {
  const session = await checkAuth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const model_id = searchParams.get("model_id") ?? undefined
  const tanggal = searchParams.get("tanggal") ?? undefined

  if (IS_DEMO) {
    const slots = getDemoBlockedSlots(model_id, tanggal)
    return NextResponse.json({ slots })
  }

  try {
    const supabase = createServerClient()
    let query = supabase.from("blocked_slots").select("id, model_id, tanggal, slot_waktu").order("tanggal").order("slot_waktu")
    if (model_id) query = query.eq("model_id", model_id)
    if (tanggal) query = query.eq("tanggal", tanggal)
    const { data, error } = await query
    if (error) throw error
    const slots = (data ?? []).map((s) => ({ ...s, slot_waktu: s.slot_waktu?.slice(0, 5) }))
    return NextResponse.json({ slots })
  } catch (err) {
    console.error("dashboard slots GET error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await checkAuth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let body: { model_id?: string; tanggal?: string; slot_waktu?: string }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { model_id, tanggal, slot_waktu } = body
  if (!model_id || !tanggal || !slot_waktu) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  if (IS_DEMO) {
    const slot: DemoBlockedSlot = { id: randomId(), model_id, tanggal, slot_waktu }
    blockDemoSlot(slot)
    return NextResponse.json({ slot })
  }

  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from("blocked_slots")
      .insert({ model_id, tanggal, slot_waktu: slot_waktu + ":00" })
      .select("id, model_id, tanggal, slot_waktu")
      .single()
    if (error) {
      if (error.code === "23505") return NextResponse.json({ error: "Slot already blocked" }, { status: 409 })
      throw error
    }
    return NextResponse.json({ slot: { ...data, slot_waktu: data.slot_waktu?.slice(0, 5) } })
  } catch (err) {
    console.error("dashboard slots POST error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await checkAuth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  if (IS_DEMO) {
    unblockDemoSlot(id)
    return NextResponse.json({ ok: true })
  }

  try {
    const supabase = createServerClient()
    const { error } = await supabase.from("blocked_slots").delete().eq("id", id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("dashboard slots DELETE error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
