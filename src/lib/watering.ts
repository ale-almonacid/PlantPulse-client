import { addDays, differenceInCalendarDays, format, isAfter, startOfDay } from "date-fns"

import type { Plant } from "@/types/plant"

// Days until the plant needs water: 0 = today, negative = overdue, null = never watered
export function getDaysUntilWatering(plant: Plant): number | null {
  const lastWaterLog = plant.waterLogs?.[0] // the server sends them newest first
  if (!lastWaterLog) return null

  const nextWatering = addDays(new Date(lastWaterLog.date), plant.frequency)
  return differenceInCalendarDays(nextWatering, new Date())
}

// Plants ordered by their next watering: overdue first, then today (or never watered), then the future
export function sortByNextWatering(plants: Plant[]): Plant[] {
  return [...plants].sort(
    (a, b) =>
      (getDaysUntilWatering(a) ?? 0) - (getDaysUntilWatering(b) ?? 0) || a.name.localeCompare(b.name)
  )
}

// "Water in 3 days", "Water tomorrow", "Water today", "Overdue by 2 days"
export function getWateringLabel(daysUntilWatering: number | null): string {
  if (daysUntilWatering === null || daysUntilWatering === 0) return "Water today"
  if (daysUntilWatering === 1) return "Water tomorrow"
  if (daysUntilWatering > 1) return `Water in ${daysUntilWatering} days`

  const daysLate = Math.abs(daysUntilWatering)
  return `Overdue by ${daysLate} ${daysLate === 1 ? "day" : "days"}`
}

// One watering to do: a plant on a day
export type WateringTask = {
  key: string // "plantId-2026-10-01", unique per plant and day
  plant: Plant
  date: Date // the day it shows under (overdue waterings show under today)
  daysLate: number // 0 unless it was due before today
}

export const toDayKey = (date: Date) => format(date, "yyyy-MM-dd")

// Every watering due from today until `days` days from now (repeats included), sorted by day
export function getWateringTasks(plants: Plant[], days: number): WateringTask[] {
  const today = startOfDay(new Date())
  const lastDay = addDays(today, days - 1)
  const tasks: WateringTask[] = []

  plants.forEach((plant) => {
    const lastWaterLog = plant.waterLogs?.[0]
    let date = lastWaterLog
      ? startOfDay(addDays(new Date(lastWaterLog.date), plant.frequency))
      : today // never watered => today

    const daysLate = Math.max(0, differenceInCalendarDays(today, date))
    if (daysLate > 0) date = today

    let isFirst = true
    while (!isAfter(date, lastDay)) {
      tasks.push({ key: `${plant.id}-${toDayKey(date)}`, plant, date, daysLate: isFirst ? daysLate : 0 })
      date = addDays(date, plant.frequency)
      isFirst = false
    }
  })

  return tasks.sort((a, b) => a.date.getTime() - b.date.getTime() || a.plant.name.localeCompare(b.plant.name))
}
