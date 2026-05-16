import { NextRequest, NextResponse } from "next/server"

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const session = req.cookies.get("dash_session")

  if (pathname.startsWith("/dashboard") && !pathname.startsWith("/dashboard/login")) {
    if (!session) {
      return NextResponse.redirect(new URL("/dashboard/login", req.url))
    }
  }

  if (pathname === "/dashboard/login" && session) {
    return NextResponse.redirect(new URL("/dashboard/overview", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
