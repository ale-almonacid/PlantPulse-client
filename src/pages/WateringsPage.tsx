import { useCallback, useEffect, useState } from "react"

// Services
import service from "@/services/index.services"

// Types
import type { Plant, WaterLog } from "@/types/plant"

// Components
import WateringHistoryList from "@/components/watering-logs/WateringHistoryList"
import WateringTodoList from "@/components/watering-logs/WateringTodoList"

// Shadcn UI Imports
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

function WateringsPage() {

  const [plants, setPlants] = useState<Plant[]>([])
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const getWaterLogs = useCallback(async () => {
    const response = await service.get<WaterLog[]>("/water-logs") // newest first, with the plant
    setWaterLogs(response.data)
  }, [])

  // after a check, edit or delete (an error just leaves the list as it was)
  const refreshWaterLogs = () => {
    getWaterLogs().catch(() => {})
  }

  useEffect(() => {
    const getData = async () => {
      try {
        const [plantsResponse] = await Promise.all([
          service.get<Plant[]>("/plants"), // includes each plant's last water log
          getWaterLogs(),
        ])
        setPlants(plantsResponse.data)
      } catch {
        setErrorMessage("Could not load the waterings. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
    getData()
  }, [getWaterLogs])

  return (
    <div className="mx-auto flex w-full max-w-360 flex-col gap-6 px-[8vw] py-8">
      <h1 className="text-3xl font-semibold tracking-tight">Waterings</h1>

      {isLoading && <p className="text-muted-foreground">Loading waterings...</p>}

      {errorMessage && <p className="text-destructive">{errorMessage}</p>}

      {!isLoading && !errorMessage && (
        <Tabs defaultValue="todo" className="gap-4">
          <TabsList>
            <TabsTrigger value="todo">To do</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* forceMount + hidden: keeps the to-do list mounted, so its ticks survive switching tabs */}
          <TabsContent value="todo" forceMount className="data-[state=inactive]:hidden">
            <WateringTodoList plants={plants} waterLogs={waterLogs} onWaterLogsChanged={refreshWaterLogs} />
          </TabsContent>

          <TabsContent value="history">
            <WateringHistoryList waterLogs={waterLogs} onWaterLogsChanged={refreshWaterLogs} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

export default WateringsPage
