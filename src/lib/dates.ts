import { format, isToday, isTomorrow, isYesterday } from "date-fns"

// "Today", "Tomorrow", "Yesterday", "Monday 29 September 2026"
export function formatDayLabel(date: Date): string {
  if (isToday(date)) return "Today"
  if (isTomorrow(date)) return "Tomorrow"
  if (isYesterday(date)) return "Yesterday"
  return format(date, "EEEE d MMMM yyyy")
}

// "2026-10-01" => the Date at the start of that day (local time)
export const fromDayKey = (day: string) => new Date(`${day}T00:00:00`)
