import { Link } from "react-router-dom"
import { format } from "date-fns"

// Shadcn Icons
import { Droplets } from "lucide-react"

// Types
import type { WaterLog } from "@/types/plant"

// Components
import PlantThumbnail from "@/components/plants/PlantThumbnail"

// Shadcn UI Imports
import { Card } from "@/components/ui/card"

type WateringCardProps = {
  waterLog: WaterLog
}

// Horizontal card (list item): plant photo on the left, plant + watering info on the right
function WateringCard({ waterLog }: WateringCardProps) {
  const plant = waterLog.plant

  return (
    <Card className="flex-row items-center gap-4 p-3">
      {/* wrapped (PlantThumbnail is a span): Card removes its top padding when an <img> is its first child */}
      <PlantThumbnail imageUrl={plant?.imageUrl} name={plant?.name} />

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {plant ? (
          <Link to={`/plants/${plant.id}`} className="truncate font-medium hover:underline">
            {plant.name}
          </Link>
        ) : (
          <p className="truncate font-medium">Deleted plant</p>
        )}
        {plant && <p className="truncate text-sm text-muted-foreground">{plant.species}</p>}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1 text-sm">
        <span className="font-medium">{format(new Date(waterLog.date), "HH:mm")}</span>
        {plant && (
          <span className="flex items-center gap-1 text-muted-foreground">
            <Droplets className="size-3.5" /> {plant.wateringAmount}
          </span>
        )}
      </div>
    </Card>
  )
}

export default WateringCard
