// Types
import type { Plant } from "@/types/plant"
import { getDaysUntilWatering, getWateringLabel } from "@/lib/watering"

// Shadcn UI Imports
import { Badge } from "@/components/ui/badge"

// "Water in 3 days" (grey), "Water today" (dark), "Overdue by 2 days" (red)
function WateringBadge({ plant }: { plant: Plant }) {
  const daysUntilWatering = getDaysUntilWatering(plant)
  const needsWater = daysUntilWatering === null || daysUntilWatering <= 0
  const isOverdue = daysUntilWatering !== null && daysUntilWatering < 0

  return (
    <Badge variant={isOverdue ? "destructive" : needsWater ? "default" : "secondary"}>
      {getWateringLabel(daysUntilWatering)}
    </Badge>
  )
}

export default WateringBadge
