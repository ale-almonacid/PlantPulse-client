import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { addDays, format } from "date-fns"

// FullCalendar (https://fullcalendar.io/docs/react)
import FullCalendar from "@fullcalendar/react"
import themePlugin from "@fullcalendar/react/themes/monarch"
import dayGridPlugin from "@fullcalendar/react/daygrid"
import rrulePlugin from "@fullcalendar/rrule" // repeating events ("every 7 days")

import "@fullcalendar/react/skeleton.css"
import "@fullcalendar/react/themes/monarch/theme.css"
import "@fullcalendar/react/themes/monarch/palettes/blue.css"

// Services
import service from "@/services/index.services"

// Types
import type { Plant } from "@/types/plant"

function CalendarPage() {

  const navigate = useNavigate()

  const [plants, setPlants] = useState<Plant[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const getPlants = async () => {
      try {
        const response = await service.get<Plant[]>("/plants") // includes each plant's last water log
        setPlants(response.data)
      } catch {
        setErrorMessage("Could not load your plants. Please try again.")
      }
    }
    getPlants()
  }, [])

  // one repeating event per plant: next watering, then every `frequency` days
  const events = useMemo(
    () =>
      plants.map((plant) => {
        const lastWaterLog = plant.waterLogs?.[0]
        const firstWatering = lastWaterLog
          ? addDays(new Date(lastWaterLog.date), plant.frequency)
          : new Date() // never watered => starts today

        return {
          id: plant.id,
          title: `💧 ${plant.name}`,
          rrule: {
            freq: "daily",
            interval: plant.frequency,
            dtstart: format(firstWatering, "yyyy-MM-dd"), // no time => all-day events
          },
        }
      }),
    [plants]
  )

  return (
    <div className="mx-auto flex w-full max-w-360 flex-col gap-6 px-[8vw] py-8 [--fc-monarch-tertiary:var(--fc-monarch-primary)] [--fc-monarch-tertiary-foreground:var(--fc-monarch-primary-foreground)]">
      <h1 className="text-3xl font-semibold tracking-tight">Calendar</h1>

      {errorMessage && <p className="text-destructive">{errorMessage}</p>}

      <FullCalendar
        plugins={[themePlugin, dayGridPlugin, rrulePlugin]}
        initialView="dayGridMonth"
        headerToolbar={{ start: "title", end: "today prev,next" }}
        events={events}
        eventClick={(info) => navigate(`/plants/${info.event.id}`)}
        height="auto"
      />
    </div>
  )
}

export default CalendarPage
