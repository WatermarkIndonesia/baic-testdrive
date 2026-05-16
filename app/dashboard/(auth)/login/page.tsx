"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/dashboard/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (data.ok) {
        router.push("/dashboard/overview")
      } else {
        setError(data.error ?? "Login failed")
      }
    } catch {
      setError("Network error, please try again")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-white font-bold text-3xl tracking-widest mb-1">BAIC</div>
          <div className="text-[#9CA3AF] text-sm">Admin Dashboard</div>
        </div>

        <div className="bg-[#13131A] border border-[#1E1E2E] rounded-xl p-8">
          <h1 className="text-white font-semibold text-lg mb-6">Sign In</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[#9CA3AF] text-xs mb-1.5 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@baic.co.id"
                className="w-full bg-[#1A1A27] border border-[#2A2A3E] text-white rounded-lg px-4 py-2.5 text-sm placeholder-[#4A4A5E] focus:outline-none focus:ring-1 focus:ring-[#4F8EF7] focus:border-[#4F8EF7] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[#9CA3AF] text-xs mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-[#1A1A27] border border-[#2A2A3E] text-white rounded-lg px-4 py-2.5 text-sm placeholder-[#4A4A5E] focus:outline-none focus:ring-1 focus:ring-[#4F8EF7] focus:border-[#4F8EF7] transition-colors"
              />
            </div>

            {error && (
              <div className="text-[#EF4444] text-sm bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-lg px-4 py-2.5">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4F8EF7] hover:bg-[#3B7BE8] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg px-4 py-2.5 text-sm transition-colors mt-2"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#1E1E2E]">
            <p className="text-[#9CA3AF] text-xs text-center">
              Demo: <span className="text-[#4F8EF7]">admin@baic.co.id</span> / <span className="text-[#4F8EF7]">baic2026</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
