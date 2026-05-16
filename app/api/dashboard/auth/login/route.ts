import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const DEMO_EMAIL = process.env.DASHBOARD_EMAIL ?? "admin@baic.co.id"
const DEMO_PASSWORD = process.env.DASHBOARD_PASSWORD ?? "baic2026"

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 })
  }

  const { email, password } = body
  if (email !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
    return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 })
  }

  const cookieStore = await cookies()
  cookieStore.set("dash_session", "demo", {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 8,
    sameSite: "lax",
  })

  return NextResponse.json({ ok: true })
}
