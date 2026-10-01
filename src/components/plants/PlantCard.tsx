import { Link } from "react-router-dom"

// Shadcn Icons
import { Leaf } from "lucide-react"

// Types
import type { Plant } from "@/types/plant"

// Components
import LogWaterButton from "@/components/plants/LogWaterButton"
import WateringBadge from "@/components/plants/WateringBadge"

// Shadcn UI Imports
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type PlantCardProps = {
  plant: Plant
  onWatered?: () => void // e.g. re-fetch the plants so the badge updates
}

function PlantCard({ plant, onWatered }: PlantCardProps) {
  return (
    <Card className="relative mx-auto w-full max-w-sm pt-0">
      <Link to={`/plants/${plant.id}`}>
        {plant.imageUrl ? (
          <img
            src={plant.imageUrl}
            alt={plant.name}
            className="aspect-square w-full object-cover"
          />
        ) : (
          <div className="flex aspect-square w-full items-center justify-center bg-muted">
            <Leaf className="size-10 text-muted-foreground" />
          </div>
        )}
      </Link>

      <CardHeader>
        <CardAction>
          <WateringBadge plant={plant} />
        </CardAction>
        <CardTitle>
          <Link to={`/plants/${plant.id}`} className="hover:underline">
            {plant.name}
          </Link>
        </CardTitle>
        <CardDescription>
          {plant.species} · {plant.wateringAmount}
        </CardDescription>
      </CardHeader>

      <CardFooter>
        <LogWaterButton plantId={plant.id} onWatered={onWatered} className="w-full" />
      </CardFooter>
    </Card>
  )
}

export default PlantCard
