import { useCallback, useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import axios from "axios"
import { format } from "date-fns"

// Shadcn Icons
import { ArrowLeft, CalendarDays, Droplets, Leaf, Timer } from "lucide-react"

// Services
import service from "@/services/index.services"

// Types
import type { Plant } from "@/types/plant"

// Components
import DeletePlantDialog from "@/components/plants/DeletePlantDialog"
import EditPlantDialog from "@/components/plants/EditPlantDialog"
import LogWaterButton from "@/components/plants/LogWaterButton"
import SpeciesInfo from "@/components/plants/SpeciesInfo"
import WateringBadge from "@/components/plants/WateringBadge"

// Shadcn UI Imports
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function PlantDetailsPage() {

  const { plantId } = useParams()

  const [plant, setPlant] = useState<Plant | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const getPlant = useCallback(async () => {
    try {
      const response = await service.get<Plant>(`/plants/${plantId}`) // includes all its water logs
      setPlant(response.data)
      setErrorMessage(null)
    } catch (error) {
      setErrorMessage(
        axios.isAxiosError(error) && error.response?.status === 404
          ? "This plant doesn't exist."
          : "Could not load the plant. Please try again."
      )
    } finally {
      setIsLoading(false)
    }
  }, [plantId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching data on mount
    getPlant()
  }, [getPlant])

  if (isLoading) {
    return <p className="mx-auto w-full max-w-360 px-[8vw] py-8 text-muted-foreground">Loading plant...</p>
  }

  if (errorMessage || !plant) {
    return (
      <div className="mx-auto flex w-full max-w-360 flex-col items-start gap-4 px-[8vw] py-8">
        <p className="text-destructive">{errorMessage}</p>
        <Button variant="outline" asChild>
          <Link to="/plants"><ArrowLeft /> Back to my plants</Link>
        </Button>
      </div>
    )
  }

  const waterLogs = plant.waterLogs ?? [] // newest first
  const lastWatered = waterLogs[0]

  return (
    <div className="mx-auto flex w-full max-w-360 flex-col gap-8 px-[8vw] py-8">

      {/* Cover */}
      <div className="relative">
        {plant.imageUrl ? (
          <img
            src={plant.imageUrl}
            alt={plant.name}
            className="aspect-video max-h-[28rem] w-full rounded-xl object-cover sm:aspect-[21/9]"
          />
        ) : (
          <div className="flex aspect-video max-h-[28rem] w-full items-center justify-center rounded-xl bg-muted sm:aspect-[21/9]">
            <Leaf className="size-16 text-muted-foreground" />
          </div>
        )}

        {/* Go back + edit/delete, on top of the cover */}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
          <Button variant="secondary" asChild>
            <Link to="/plants"><ArrowLeft /> My plants</Link>
          </Button>
          <div className="flex items-center gap-2">
            <EditPlantDialog plant={plant} onPlantUpdated={getPlant} />
            <DeletePlantDialog plantId={plant.id} plantName={plant.name} />
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <WateringBadge plant={plant} />
          <h1 className="text-3xl font-semibold tracking-tight">{plant.name}</h1>
          <p className="text-muted-foreground">{plant.species}</p>
        </div>
        <LogWaterButton plantId={plant.id} onWatered={getPlant} className="sm:w-48" />
      </header>

      {/* Watering info */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-lg border p-4">
          <Droplets className="size-5 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Amount</p>
            <p className="font-medium">{plant.wateringAmount}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border p-4">
          <Timer className="size-5 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Frequency</p>
            <p className="font-medium">Every {plant.frequency} {plant.frequency === 1 ? "day" : "days"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border p-4">
          <CalendarDays className="size-5 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Last watered</p>
            <p className="font-medium">
              {lastWatered ? format(new Date(lastWatered.date), "d MMM yyyy") : "Not yet"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Species from Perenual */}
        <Card>
          <CardHeader>
            <CardTitle>About this species</CardTitle>
          </CardHeader>
          <CardContent>
            <SpeciesInfo species={plant.species} />
          </CardContent>
        </Card>

        {/* Watering history */}
        <Card>
          <CardHeader>
            <CardTitle>Watering history</CardTitle>
          </CardHeader>
          <CardContent>
            {waterLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No waterings logged yet.</p>
            ) : (
              <ul className="flex max-h-64 flex-col gap-2 overflow-y-auto">
                {waterLogs.map((waterLog) => (
                  <li key={waterLog.id} className="flex items-center gap-2 text-sm">
                    <Droplets className="size-4 text-muted-foreground" />
                    {format(new Date(waterLog.date), "EEEE d MMM yyyy, HH:mm")}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}

export default PlantDetailsPage
