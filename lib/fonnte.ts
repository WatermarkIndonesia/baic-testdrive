const FONNTE_API_URL = "https://api.fonnte.com/send"

export async function sendWhatsApp(
  nomor: string,
  pesan: string
): Promise<{ success: boolean; error?: string }> {
  const token = process.env.FONNTE_TOKEN
  if (!token) {
    console.log("[WA MOCK]", { nomor, pesan })
    return { success: true }
  }
  try {
    const res = await fetch(FONNTE_API_URL, {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ target: nomor, message: pesan, countryCode: "62" }),
    })
    const data = await res.json()
    return { success: data.status === true }
  } catch (err) {
    console.error("Fonnte error:", err)
    return { success: false, error: String(err) }
  }
}

export function templateKonfirmasi(data: {
  nama: string
  model_nama: string
  tanggal: string
  slot_waktu: string
  booking_code: string
}): string {
  return `Hi ${data.nama},

Your *BAIC ARCFOX Test Drive* is confirmed. ✅

*Booking Details*
🚗 Model   : ${data.model_nama}
📅 Date    : ${data.tanggal}
⏰ Time    : ${data.slot_waktu} WIB
📍 Venue   : BAIC Booth — ICE BSD, Tangerang
🎫 Code    : *${data.booking_code}*

We'll send you a reminder 15 minutes before your session begins. Please keep this message handy — our team will verify your code at the booth.

See you at GIIAS 2026. 🙌
— _BAIC Indonesia_`
}

export function templateReminder(data: {
  nama: string
  model_nama: string
  slot_waktu: string
  booking_code: string
}): string {
  return `Hi ${data.nama}, your test drive starts in *15 minutes.* ⏱️

🚗 ${data.model_nama}
⏰ *${data.slot_waktu} WIB — TODAY*

Please make your way to the BAIC test drive area now and show this code to our team:

*${data.booking_code}*

We look forward to seeing you. ✨
— _BAIC GIIAS 2026_`
}
