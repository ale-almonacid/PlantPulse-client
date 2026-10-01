import { useMemo, useState } from "react"
import { isToday, startOfDay } from "date-fns"
import axios from "axios"

// Services
import service from "@/services/index.services"

// Types
import type { Plant, WaterLog } from "@/types/plant"
import { getWateringTasks, toDayKey, type WateringTask } from "@/lib/watering"

// Components
import DateSeparator from "@/components/watering-logs/DateSeparator"
import WateringTodoCard from "@/components/watering-logs/WateringTodoCard"

import { fromDayKey } from "@/lib/dates"

// ℹ️ How many days ahead the to-do list shows (today included)
const DAYS_AHEAD = 7

type WateringTodoListProps = {
  plants: Plant[] // each with its last water log
  waterLogs: WaterLog[] // all logs, used to show today's waterings as already checked
  onWaterLogsChanged?: () => void // e.g. re-fetch the history
}

// ℹ️ The list is worked out ONCE from the data it gets on mount, so a checked task
// stays checked in its place instead of the list re-ordering after each click
function WateringTodoList({ plants, waterLogs, onWaterLogsChanged }: WateringTodoListProps) {

  // plants watered today show as checked tasks under "Today"
  const [initialDone] = useState(() => {
    const done = new Map<string, WaterLog>()
    waterLogs.forEach((waterLog) => {
      if (isToday(new Date(waterLog.date)) && !done.has(waterLog.plantId)) {
        done.set(waterLog.plantId, waterLog)
      }
    })
    return done
  })

  const [tasks] = useState<WateringTask[]>(() => {
    const today = startOfDay(new Date())
    const doneToday: WateringTask[] = []
    initialDone.forEach((waterLog) => {
      const plant = plants.find((p) => p.id === waterLog.plantId)
      if (plant) doneToday.push({ key: `${plant.id}-${toDayKey(today)}`, plant, date: today, daysLate: 0 })
    })
    const keys = new Set(doneToday.map((task) => task.key))
    return [...doneToday, ...getWateringTasks(plants, DAYS_AHEAD).filter((task) => !keys.has(task.key))]
      .sort((a, b) => a.date.getTime() - b.date.getTime() || a.plant.name.localeCompare(b.plant.name))
  })

  // task key => id of the water log it created ("saving" while the request runs)
  const [checked, setChecked] = useState<Map<string, string>>(() => {
    const map = new Map<string, string>()
    initialDone.forEach((waterLog, plantId) => map.set(`${plantId}-${toDayKey(new Date())}`, waterLog.id))
    return map
  })
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const updateChecked = (key: string, value: string | null) => {
    setChecked((previous) => {
      const next = new Map(previous)
      if (value === null) next.delete(key)
      else next.set(key, value)
      return next
    })
  }

  const handleToggle = async (task: WateringTask) => {
    const waterLogId = checked.get(task.key)
    if (waterLogId === "saving") return
    setErrorMessage(null)

    if (waterLogId) {
      // uncheck => delete the water log it created
      updateChecked(task.key, null) // un-ticks right away, the animation doesn't wait for the server
      try {
        await service.delete(`/water-logs/${waterLogId}`)
        onWaterLogsChanged?.()
      } catch (error) {
        updateChecked(task.key, waterLogId)
        setErrorMessage(getErrorMessage(error, "Could not undo the watering."))
      }
      return
    }

    // check => log the watering (now)
    updateChecked(task.key, "saving") // ticks right away
    try {
      const response = await service.post<WaterLog>("/water-logs", { plantId: task.plant.id })
      updateChecked(task.key, response.data.id)
      onWaterLogsChanged?.()
    } catch (error) {
      updateChecked(task.key, null)
      setErrorMessage(getErrorMessage(error, "Could not log the watering."))
    }
  }

  const tasksByDay = useMemo(() => {
    const days = new Map<string, WateringTask[]>()
    tasks.forEach((task) => {
      const key = toDayKey(task.date)
      days.set(key, [...(days.get(key) ?? []), task])
    })
    return [...days.entries()]
  }, [tasks])

  if (tasks.length === 0) {
    return <p className="text-muted-foreground">Nothing to water this week.</p>
  }

  return (
    <div className="flex flex-col gap-3">
      {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

      <div className="flex max-h-[70vh] flex-col gap-6 overflow-y-auto p-1 pr-3">
        {tasksByDay.map(([day, dayTasks]) => (
          <section key={day} className="flex flex-col gap-3">
            <DateSeparator date={fromDayKey(day)} />
            {dayTasks.map((task) => (
              <WateringTodoCard
                key={task.key}
                task={task}
                checked={checked.has(task.key)}
                onToggle={() => handleToggle(task)}
              />
            ))}
          </section>
        ))}
      </div>
    </div>
  )
}

const getErrorMessage = (error: unknown, fallback: string) =>
  (axios.isAxiosError(error) && error.response?.data?.errorMessage) || `${fallback} Please try again.`

export default WateringTodoList
