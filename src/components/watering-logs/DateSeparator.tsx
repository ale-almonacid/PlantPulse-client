// Shadcn UI Imports
import { Separator } from "@/components/ui/separator"

import { formatDayLabel } from "@/lib/dates"

// ——— Today ———
function DateSeparator({ date }: { date: Date }) {
  return (
    <div className="flex items-center gap-3">
      <Separator className="flex-1" />
      <span className="shrink-0 text-xs font-medium text-muted-foreground">
        {formatDayLabel(date)}
      </span>
      <Separator className="flex-1" />
    </div>
  )
}

export default DateSeparator
