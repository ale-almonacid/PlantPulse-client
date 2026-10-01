import { useEffect, useState } from "react"

// Services
import service from "@/services/index.services"

// Types
import type { Plant } from "@/types/plant"

// Components
import CreatePlantDialog from "@/components/plants/CreatePlantDialog"
import PlantCard from "@/components/plants/PlantCard"

function PlantsListPage() {

  const [plants, setPlants] = useState<Plant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const getPlants = async () => {
    try {
      const response = await service.get<Plant[]>("/plants")
      setPlants(response.data)
      setErrorMessage(null)
    } catch {
      setErrorMessage("Could not load your plants. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching data on mount
    getPlants()
  }, [])

  return (
    <div className="mx-auto w-full max-w-360 px-[8vw] py-8">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">My plants</h1>
        <CreatePlantDialog onPlantCreated={getPlants} />
      </header>

      {isLoading && <p className="mt-8 text-muted-foreground">Loading plants...</p>}

      {errorMessage && <p className="mt-8 text-destructive">{errorMessage}</p>}

      {!isLoading && !errorMessage && plants.length === 0 && (
        <p className="mt-8 text-muted-foreground">No plants yet. Add your first one!</p>
      )}

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {plants.map((plant) => (
          <PlantCard key={plant.id} plant={plant} onWatered={getPlants} />
        ))}
      </div>
    </div>
  )
}

export default PlantsListPage
