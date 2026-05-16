export function generateBookingCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = "BTC-"
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export function normalizeWANumber(input: string): string {
  let num = input.replace(/\D/g, "")
  if (num.startsWith("0")) num = "62" + num.slice(1)
  if (num.startsWith("62")) return num
  return "62" + num
}

export function formatTanggal(date: string): string {
  return new Date(date + "T00:00:00").toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  })
}

export function formatSlotDisplay(slot: string): string {
  return slot + " WIB"
}
