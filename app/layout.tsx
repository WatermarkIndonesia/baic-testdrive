import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "BAIC ARCFOX — Test Drive GIIAS 2026",
  description: "Book slot test drive BAIC ARCFOX di GIIAS ICE BSD 2026. Pengalaman premium, tanpa antrian.",
  openGraph: {
    title: "BAIC ARCFOX — Test Drive GIIAS 2026",
    description: "Book slot test drive BAIC ARCFOX di GIIAS ICE BSD 2026.",
    locale: "id_ID",
    type: "website",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="antialiased bg-[#0A0A0F] text-[#F0F0F5]">
        {children}
      </body>
    </html>
  )
}
