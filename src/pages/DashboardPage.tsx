import { useCallback, useEffect, useState } from "react"

// Services
import service from "@/services/index.services"

// Types
import type { Plant, WaterLog } from "@/types/plant"
import { sortByNextWatering } from "@/lib/watering"

// Components
import PlantCard from "@/components/plants/PlantCard"
import WateringTodoList from "@/components/watering-logs/WateringTodoList"

// Shadcn UI Imports
import { Separator } from "@/components/ui/separator"

function DashboardPage() {

  const [plants, setPlants] = useState<Plant[]>([])
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  // ℹ️ The to-do list only reads its data when it mounts, so changing its key re-creates it with the new data
  const [todoListKey, setTodoListKey] = useState(0)

  const getData = useCallback(async () => {
    try {
      const [plantsResponse, waterLogsResponse] = await Promise.all([
        service.get<Plant[]>("/plants"), // includes each plant's last water log
        service.get<WaterLog[]>("/water-logs"),
      ])
      setPlants(plantsResponse.data)
      setWaterLogs(waterLogsResponse.data)
      setErrorMessage(null)
    } catch {
      setErrorMessage("Could not load your plants. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching data on mount
    getData()
  }, [getData])

  // watered from a plant card => the Today list has to show it too
  const handleWateredFromCard = async () => {
    await getData()
    setTodoListKey((key) => key + 1)
  }

  return (
    <div id="content" className="mx-auto flex w-full max-w-360 flex-col gap-8 px-[8vw] py-8">

      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground">Here's what your plants need today.</p>
      </header>

      {isLoading && <p className="text-muted-foreground">Loading...</p>}

      {errorMessage && <p className="text-destructive">{errorMessage}</p>}

      {!isLoading && !errorMessage && (
        <>
          {/* Today: the same checklist as the Waterings page (ticking one refreshes the plant badges below) */}
          <WateringTodoList
            key={todoListKey}
            plants={plants}
            waterLogs={waterLogs}
            onWaterLogsChanged={getData}
            showNextWaterings={false}
          />

          {plants.length > 0 && (
            <section className="flex flex-col gap-3">
              <Separator />
              <h3 className="text-lg font-semibold tracking-tight">My plants</h3>
              <div className="mt-3 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* the ones that need water first */}
                {sortByNextWatering(plants).map((plant) => (
                  <PlantCard key={plant.id} plant={plant} onWatered={handleWateredFromCard} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}

export default DashboardPage
