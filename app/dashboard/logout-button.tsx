"use client"

import { useRouter } from "next/navigation"

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await fetch("/api/dashboard/auth/logout", { method: "POST" })
    router.push("/dashboard/login")
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full text-left px-3 py-2 rounded-lg text-sm text-[#9CA3AF] hover:text-white hover:bg-[#1A1A27] transition-colors"
    >
      Sign Out
    </button>
  )
}
