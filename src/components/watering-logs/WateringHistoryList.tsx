import { useMemo } from "react"
import { format } from "date-fns"

// Types
import type { WaterLog } from "@/types/plant"

// Components
import DateSeparator from "@/components/watering-logs/DateSeparator"
import WateringCard from "@/components/watering-logs/WateringCard"

import { fromDayKey } from "@/lib/dates"

// Logged waterings grouped by day, newest day first
type WateringHistoryListProps = {
  waterLogs: WaterLog[]
  onWaterLogsChanged?: () => void // after editing or deleting one, e.g. re-fetch them
}

function WateringHistoryList({ waterLogs, onWaterLogsChanged }: WateringHistoryListProps) {

  const waterLogsByDay = useMemo(() => {
    const days = new Map<string, WaterLog[]>()
    waterLogs.forEach((waterLog) => {
      const key = format(new Date(waterLog.date), "yyyy-MM-dd")
      days.set(key, [...(days.get(key) ?? []), waterLog])
    })
    return [...days.entries()]
  }, [waterLogs])

  if (waterLogs.length === 0) {
    return <p className="text-muted-foreground">No waterings logged yet.</p>
  }

  return (
    <div className="flex max-h-[70vh] flex-col gap-6 overflow-y-auto p-1 pr-3">
      {waterLogsByDay.map(([day, dayWaterLogs]) => (
        <section key={day} className="flex flex-col gap-3">
          <DateSeparator date={fromDayKey(day)} />
          {dayWaterLogs.map((waterLog) => (
            <WateringCard key={waterLog.id} waterLog={waterLog} onWateringChanged={onWaterLogsChanged} />
          ))}
        </section>
      ))}
    </div>
  )
}

export default WateringHistoryList
