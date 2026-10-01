import { format } from "date-fns"

// Shadcn Icons
import { Check, Droplets, Loader2 } from "lucide-react"

// Types
import type { Plant } from "@/types/plant"

// Components
import PlantThumbnail from "@/components/plants/PlantThumbnail"

// Shadcn UI Imports
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

type WateringUpcomingCardProps = {
  plant: Plant
  nextWatering: Date
  daysUntil: number
  onWaterNow: () => void
  isSaving?: boolean
  isWateredToday?: boolean // already watered today => no "Water now" again
}

// Same horizontal card as WateringCard: when the plant needs water next + a "Water now" button
function WateringUpcomingCard({ plant, nextWatering, daysUntil, onWaterNow, isSaving, isWateredToday }: WateringUpcomingCardProps) {
  return (
    <Card className="flex-row items-center gap-4 p-3">
      <PlantThumbnail imageUrl={plant.imageUrl} name={plant.name} />

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="truncate font-medium">{plant.name}</p>
        <p className="truncate text-sm text-muted-foreground">
          {daysUntil === 1 ? "Tomorrow" : `In ${daysUntil} days`} · {format(nextWatering, "EEE d MMM")}
        </p>
      </div>

      {isWateredToday ? (
        <Button variant="ghost" size="sm" disabled>
          <Check /> Watered today
        </Button>
      ) : (
        <Button variant="outline" size="sm" onClick={onWaterNow} disabled={isSaving}>
          {isSaving ? <Loader2 className="animate-spin" /> : <Droplets />}
          {isSaving ? "Watering..." : "Water now"}
        </Button>
      )}
    </Card>
  )
}

export default WateringUpcomingCard
