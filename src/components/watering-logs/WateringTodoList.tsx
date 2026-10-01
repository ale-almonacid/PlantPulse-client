import { useMemo, useState } from "react"
import { addDays, isToday, startOfDay } from "date-fns"
import axios from "axios"

// Services
import service from "@/services/index.services"

// Types
import type { Plant, WaterLog } from "@/types/plant"
import { getDaysUntilWatering, getWateringTasks, toDayKey, type WateringTask } from "@/lib/watering"

// Components
import WateringTodoCard from "@/components/watering-logs/WateringTodoCard"
import AllWateredEmpty from "@/components/watering-logs/AllWateredEmpty"
import WateringUpcomingCard from "@/components/watering-logs/WateringUpcomingCard"

// Shadcn UI Imports
import { Separator } from "@/components/ui/separator"

type WateringTodoListProps = {
  plants: Plant[] // each with its last water log
  waterLogs: WaterLog[] // all logs, used to show today's waterings as already checked
  onWaterLogsChanged?: () => void // e.g. re-fetch the history
  showNextWaterings?: boolean // false => only the Today section, without its own scroll (dashboard)
}

// A plant that isn't due today, and when it is
type UpcomingWatering = {
  plant: Plant
  date: Date
  daysUntil: number
}

const todayKeyOf = (plant: Plant) => `${plant.id}-${toDayKey(new Date())}`

const sortTasks = (tasks: WateringTask[]) =>
  [...tasks].sort((a, b) => b.daysLate - a.daysLate || a.plant.name.localeCompare(b.plant.name))

//  The lists are worked out ONCE from the data they get on mount, so a checked task
// stays checked in its place instead of the list re-ordering after each click
function WateringTodoList({ plants, waterLogs, onWaterLogsChanged, showNextWaterings = true }: WateringTodoListProps) {

  // plants watered today => plant id: that water log
  const [wateredToday] = useState(() => {
    const done = new Map<string, WaterLog>()
    waterLogs.forEach((waterLog) => {
      if (isToday(new Date(waterLog.date)) && !done.has(waterLog.plantId)) {
        done.set(waterLog.plantId, waterLog)
      }
    })
    return done
  })

  // plants that need water today (due or overdue) and weren't watered yet
  const [dueTasks] = useState(() =>
    getWateringTasks(plants, 1).filter((task) => !wateredToday.has(task.plant.id))
  )

  // plants watered on an earlier day that don't need water today => shown ticked, like the ones watered today
  const [notDue] = useState(() => {
    const dueIds = new Set(dueTasks.map((task) => task.plant.id))
    return new Set(plants.filter((plant) => !dueIds.has(plant.id) && !wateredToday.has(plant.id)).map((plant) => plant.id))
  })

  // Today: every plant. The ones to water first (unticked), then the ones that are already fine (ticked)
  const [todayTasks] = useState<WateringTask[]>(() => {
    const today = startOfDay(new Date())
    const dueIds = new Set(dueTasks.map((task) => task.plant.id))
    const done = plants
      .filter((plant) => !dueIds.has(plant.id))
      .map((plant) => ({ key: todayKeyOf(plant), plant, date: today, daysLate: 0 }))
    return [...sortTasks(dueTasks), ...sortTasks(done)]
  })

  // task key => id of its water log ("saving" while the request runs)
  const [checked, setChecked] = useState<Map<string, string>>(() => {
    const map = new Map<string, string>()
    wateredToday.forEach((waterLog, plantId) => map.set(`${plantId}-${toDayKey(new Date())}`, waterLog.id))
    return map
  })
  // once everything is watered the list is hidden by default ("Show list" brings it back)
  const [isListVisible, setIsListVisible] = useState(false)
  const [savingPlantId, setSavingPlantId] = useState<string | null>(null)
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
      // uncheck => delete the water log
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

  // watered today (a real water log from today, not just "not due")
  const isWateredToday = (plant: Plant) => {
    const waterLogId = checked.get(todayKeyOf(plant))
    return Boolean(waterLogId) && waterLogId !== "saving"
  }

  // Next waterings: the next watering of every plant, soonest first.
  // Watered today => in `frequency` days. Still to water today => only in Today.
  const upcoming = useMemo<UpcomingWatering[]>(() => {
    const today = startOfDay(new Date())
    return plants
      .flatMap((plant) => {
        const waterLogId = checked.get(todayKeyOf(plant))
        if (waterLogId && waterLogId !== "saving") {
          return [{ plant, daysUntil: plant.frequency, date: addDays(today, plant.frequency) }]
        }
        if (!notDue.has(plant.id)) return [] // still to water today
        const daysUntil = getDaysUntilWatering(plant) ?? 0
        return [{ plant, daysUntil, date: addDays(today, daysUntil) }]
      })
      .sort((a, b) => a.daysUntil - b.daysUntil || a.plant.name.localeCompare(b.plant.name))
  }, [plants, notDue, checked])

  // "Water now" => logs it, so its tick in Today becomes one you can undo
  const handleWaterNow = async (item: UpcomingWatering) => {
    setSavingPlantId(item.plant.id)
    setErrorMessage(null)

    try {
      const response = await service.post<WaterLog>("/water-logs", { plantId: item.plant.id })
      updateChecked(todayKeyOf(item.plant), response.data.id)
      onWaterLogsChanged?.()
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Could not log the watering."))
    } finally {
      setSavingPlantId(null)
    }
  }

  const isAllWatered = todayTasks.every((task) => notDue.has(task.plant.id) || isWateredToday(task.plant))

  if (plants.length === 0) {
    return <p className="text-muted-foreground">No plants yet. Add one in My plants.</p>
  }

  return (
    <div className="flex flex-col gap-3">
      {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

      <div className={showNextWaterings ? "flex max-h-[70vh] flex-col gap-6 overflow-y-auto p-1 pr-3" : "flex flex-col gap-6"}>
        <section className="flex flex-col gap-3">
          <Separator />
          <h3 className="text-lg font-semibold tracking-tight">Today's pending waterings</h3>
          {isAllWatered && (
            <AllWateredEmpty
              isListVisible={isListVisible}
              onToggleList={() => setIsListVisible((visible) => !visible)}
            />
          )}
          {(isListVisible || !isAllWatered) &&
            todayTasks.map((task) => (
              <WateringTodoCard
                key={task.key}
                task={task}
                checked={checked.has(task.key) || notDue.has(task.plant.id)}
                onToggle={() => handleToggle(task)}
                // watered on an earlier day: there's no watering from today to undo
                disabled={notDue.has(task.plant.id) && !checked.has(task.key)}
              />
            ))}
        </section>

        {showNextWaterings && upcoming.length > 0 && (
          <section className="flex flex-col gap-3">
            <Separator />
            <h3 className="text-lg font-semibold tracking-tight">Next waterings</h3>
            {upcoming.map((item) => (
              <WateringUpcomingCard
                key={item.plant.id}
                plant={item.plant}
                nextWatering={item.date}
                daysUntil={item.daysUntil}
                onWaterNow={() => handleWaterNow(item)}
                isSaving={savingPlantId === item.plant.id}
                isWateredToday={isWateredToday(item.plant)}
              />
            ))}
          </section>
        )}
      </div>
    </div>
  )
}

const getErrorMessage = (error: unknown, fallback: string) =>
  (axios.isAxiosError(error) && error.response?.data?.errorMessage) || `${fallback} Please try again.`

export default WateringTodoList
