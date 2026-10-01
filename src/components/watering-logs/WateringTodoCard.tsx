// Shadcn Icons
import { Droplets } from "lucide-react"

// Types
import type { WateringTask } from "@/lib/watering"

// Components
import { ChecklistItem } from "@/components/checklist/Checklist"
import PlantThumbnail from "@/components/plants/PlantThumbnail"

// Shadcn UI Imports
import { Card } from "@/components/ui/card"

type WateringTodoCardProps = {
  task: WateringTask
  checked: boolean
  onToggle: () => void
  disabled?: boolean
}

// Same horizontal card as WateringCard, but the whole card is a checkbox
function WateringTodoCard({ task, checked, onToggle, disabled }: WateringTodoCardProps) {
  const { plant, daysLate } = task

  return (
    <Card className="p-0">
      <ChecklistItem
        checked={checked}
        onToggle={onToggle}
        disabled={disabled}
        className="gap-4 rounded-xl p-3"
        label={plant.name}
        media={<PlantThumbnail imageUrl={plant.imageUrl} name={plant.name} />}
        description={<span className="truncate text-sm text-muted-foreground">{plant.species}</span>}
        aside={
          <span className="flex shrink-0 flex-col items-end gap-1 text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Droplets className="size-3.5" /> {plant.wateringAmount}
            </span>
            {daysLate > 0 && !checked && (
              <span className="text-xs font-medium text-destructive">
                {daysLate} {daysLate === 1 ? "day" : "days"} late
              </span>
            )}
          </span>
        }
      />
    </Card>
  )
}

export default WateringTodoCard
