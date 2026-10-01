import { addDays, differenceInCalendarDays } from "date-fns"

import type { Plant } from "@/types/plant"

// Days until the plant needs water: 0 = today, negative = overdue, null = never watered
export function getDaysUntilWatering(plant: Plant): number | null {
  const lastWaterLog = plant.waterLogs?.[0] // the server sends them newest first
  if (!lastWaterLog) return null

  const nextWatering = addDays(new Date(lastWaterLog.date), plant.frequency)
  return differenceInCalendarDays(nextWatering, new Date())
}

// "Water in 3 days", "Water tomorrow", "Water today", "Overdue by 2 days"
export function getWateringLabel(daysUntilWatering: number | null): string {
  if (daysUntilWatering === null || daysUntilWatering === 0) return "Water today"
  if (daysUntilWatering === 1) return "Water tomorrow"
  if (daysUntilWatering > 1) return `Water in ${daysUntilWatering} days`

  const daysLate = Math.abs(daysUntilWatering)
  return `Overdue by ${daysLate} ${daysLate === 1 ? "day" : "days"}`
}
