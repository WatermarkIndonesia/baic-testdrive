import Link from "next/link"
import Image from "next/image"
import { CAR_MODELS } from "@/lib/constants"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0F] overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-[#1E1E2E] bg-[#0A0A0F]/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#4F8EF7] flex items-center justify-center">
            <span className="text-white font-bold text-xs">B</span>
          </div>
          <span className="text-[#F0F0F5] font-semibold text-sm tracking-wide">BAIC ARCFOX</span>
        </div>
        <Link
          href="/booking"
          className="text-xs font-medium text-[#4F8EF7] border border-[#4F8EF7]/40 rounded-full px-4 py-2 hover:bg-[#4F8EF7]/10 transition-colors"
        >
          Reserve Now
        </Link>
      </header>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 text-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#4F8EF7]/5 blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-[#7C5CBF]/5 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 border border-[#4F8EF7]/30 bg-[#4F8EF7]/5 rounded-full px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4F8EF7] animate-pulse" />
            <span className="text-[#4F8EF7] text-xs font-medium tracking-wider uppercase">
              GIIAS · ICE BSD · 30 Jul – 9 Aug 2026
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-normal text-[#F0F0F5] leading-tight mb-5" style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}>
            Drive the<br />
            <span className="text-[#4F8EF7]">BAIC ARCFOX</span>
          </h1>
          <p className="text-[#8888AA] text-base md:text-lg leading-relaxed mb-10 max-w-xs mx-auto">
            Reserve your exclusive test drive slot before you arrive. Your time, confirmed — no queues, no waiting.
          </p>

          <Link
            href="/booking"
            className="inline-flex items-center gap-3 bg-[#4F8EF7] hover:bg-[#3a7aef] text-white font-semibold rounded-2xl px-8 py-4 text-base transition-all duration-200 shadow-lg shadow-[#4F8EF7]/20 hover:shadow-[#4F8EF7]/30 hover:-translate-y-0.5"
          >
            Reserve Your Slot
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 pb-12">
        <div className="max-w-xl mx-auto">
          <div className="grid grid-cols-3 gap-3 mb-14">
            {[
              { label: "Event Days", value: "11" },
              { label: "Models Available", value: "4" },
              { label: "Slots Per Day", value: "80" },
            ].map((s) => (
              <div key={s.label} className="bg-[#12121A] border border-[#1E1E2E] rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-[#4F8EF7]">{s.value}</div>
                <div className="text-[#F0F0F5] text-[11px] mt-1 font-medium">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Car grid */}
          <h2 className="text-xl font-semibold text-[#F0F0F5] mb-5 text-center">Choose Your Drive</h2>
          <div className="grid grid-cols-2 gap-3">
            {CAR_MODELS.map((car) => (
              <Link
                key={car.id}
                href="/booking"
                className="group bg-[#12121A] border border-[#1E1E2E] rounded-2xl overflow-hidden hover:border-[#4F8EF7]/40 transition-all duration-200"
              >
                <div className="relative w-full aspect-video bg-[#0A0A0F] overflow-hidden">
                  <Image
                    src={car.gambar_url}
                    alt={car.nama}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
                <div className="p-3">
                  <div className="text-[#F0F0F5] font-semibold text-sm">{car.nama}</div>
                  <div className="text-[#8888AA] text-xs mt-0.5">{car.variant}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 pb-16">
        <div className="max-w-xl mx-auto">
          <h2 className="text-xl font-semibold text-[#F0F0F5] mb-5 text-center">How It Works</h2>
          <div className="space-y-3">
            {[
              { step: "01", title: "Pick Your Model & Time", desc: "Browse all four ARCFOX models and select an available slot." },
              { step: "02", title: "Enter Your Details", desc: "Your name and WhatsApp number — that's all we need." },
              { step: "03", title: "Receive Instant Confirmation", desc: "Your booking details are sent directly to your WhatsApp." },
            ].map((s) => (
              <div key={s.step} className="flex items-start gap-4 bg-[#12121A] border border-[#1E1E2E] rounded-2xl p-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-[#4F8EF7]/10 flex items-center justify-center">
                  <span className="text-[#4F8EF7] text-xs font-bold" style={{ fontFamily: '"JetBrains Mono", monospace' }}>{s.step}</span>
                </div>
                <div>
                  <div className="text-[#F0F0F5] font-semibold text-sm">{s.title}</div>
                  <div className="text-[#8888AA] text-xs mt-0.5 leading-relaxed">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 bg-[#4F8EF7] hover:bg-[#3a7aef] text-white font-semibold rounded-2xl px-8 py-4 text-sm transition-all duration-200"
            >
              Reserve Your Slot
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1E1E2E] px-6 py-8 text-center">
        <p className="text-[#8888AA] text-xs">© 2026 BAIC Indonesia · GIIAS ICE BSD Tangerang</p>
        <p className="text-[#8888AA]/40 text-xs mt-1">Powered by Watermark Indonesia</p>
      </footer>
    </main>
  )
}
