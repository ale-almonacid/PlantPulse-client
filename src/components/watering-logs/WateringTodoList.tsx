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

  // Today: due today, overdue, or already watered today
  const [todayTasks, setTodayTasks] = useState<WateringTask[]>(() => {
    const today = startOfDay(new Date())
    const done = plants
      .filter((plant) => wateredToday.has(plant.id))
      .map((plant) => ({ key: todayKeyOf(plant), plant, date: today, daysLate: 0 }))
    const due = getWateringTasks(plants, 1).filter((task) => !wateredToday.has(task.plant.id))
    return sortTasks([...done, ...due])
  })

  // task key => id of its water log ("saving" while the request runs)
  const [checked, setChecked] = useState<Map<string, string>>(() => {
    const map = new Map<string, string>()
    wateredToday.forEach((waterLog, plantId) => map.set(`${plantId}-${toDayKey(new Date())}`, waterLog.id))
    return map
  })
  // plants that got into "Today" only because of "Water now"
  const [addedWithWaterNow, setAddedWithWaterNow] = useState<Set<string>>(new Set())
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

        // it was only in Today because of "Water now" => it leaves Today again
        if (addedWithWaterNow.has(task.plant.id)) {
          setTodayTasks((tasks) => tasks.filter((t) => t.key !== task.key))
          setAddedWithWaterNow((added) => {
            const next = new Set(added)
            next.delete(task.plant.id)
            return next
          })
        }
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

  // Next waterings: the next watering of every plant, soonest first.
  // Watered today => in `frequency` days. Still to water today => only in Today.
  const upcoming = useMemo<UpcomingWatering[]>(() => {
    const today = startOfDay(new Date())
    return plants
      .flatMap((plant) => {
        const todayTask = todayTasks.find((task) => task.plant.id === plant.id)
        if (todayTask) {
          const waterLogId = checked.get(todayTask.key)
          if (!waterLogId || waterLogId === "saving") return []
          return [{ plant, daysUntil: plant.frequency, date: addDays(today, plant.frequency) }]
        }
        const daysUntil = getDaysUntilWatering(plant) ?? 0
        return [{ plant, daysUntil, date: addDays(today, daysUntil) }]
      })
      .sort((a, b) => a.daysUntil - b.daysUntil || a.plant.name.localeCompare(b.plant.name))
  }, [plants, todayTasks, checked])

  // "Water now" => logs it and adds the plant to Today, checked
  const handleWaterNow = async (item: UpcomingWatering) => {
    setSavingPlantId(item.plant.id)
    setErrorMessage(null)

    try {
      const response = await service.post<WaterLog>("/water-logs", { plantId: item.plant.id })
      const task: WateringTask = { key: todayKeyOf(item.plant), plant: item.plant, date: startOfDay(new Date()), daysLate: 0 }

      updateChecked(task.key, response.data.id)
      setTodayTasks((tasks) => [...tasks, task])
      setAddedWithWaterNow((added) => new Set(added).add(item.plant.id))
      onWaterLogsChanged?.()
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Could not log the watering."))
    } finally {
      setSavingPlantId(null)
    }
  }

  const isAllWatered = todayTasks.every((task) => {
    const waterLogId = checked.get(task.key)
    return waterLogId && waterLogId !== "saving"
  })

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
              onToggleList={todayTasks.length > 0 ? () => setIsListVisible((visible) => !visible) : undefined}
            />
          )}
          {(isListVisible || !isAllWatered) &&
            todayTasks.map((task) => (
              <WateringTodoCard
                key={task.key}
                task={task}
                checked={checked.has(task.key)}
                onToggle={() => handleToggle(task)}
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
                isWateredToday={todayTasks.some((task) => task.plant.id === item.plant.id)}
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
