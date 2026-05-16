"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

interface NavLinkProps {
  href: string
  children: React.ReactNode
}

export default function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname()
  const active = pathname === href || pathname.startsWith(href + "/")

  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
        active
          ? "bg-[#4F8EF7]/15 text-[#4F8EF7] font-medium"
          : "text-[#9CA3AF] hover:text-white hover:bg-[#1A1A27]"
      }`}
    >
      {children}
    </Link>
  )
}
