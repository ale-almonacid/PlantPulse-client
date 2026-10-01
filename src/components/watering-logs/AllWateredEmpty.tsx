import { Droplets } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

type AllWateredEmptyProps = {
  isListVisible: boolean
  onToggleList?: () => void // no button when there's no list to show
}

// Based on shadcn's "Empty Outline", light blue and without the dashed border
function AllWateredEmpty({ isListVisible, onToggleList }: AllWateredEmptyProps) {
  return (
    <Empty className="bg-sky-500/8 py-7 ">
      <EmptyHeader>
        <EmptyMedia variant="icon" className="bg-sky-500/15 text-sky-500">
          <Droplets />
        </EmptyMedia>
        <EmptyTitle >You're all done for today</EmptyTitle>
        <EmptyDescription >
          All your plants are watered.
        </EmptyDescription>
      </EmptyHeader>
      {onToggleList && (
        <EmptyContent>
          <Button variant="outline" size="sm" onClick={onToggleList}>
            {isListVisible ? "Hide list" : "Show list"}
          </Button>
        </EmptyContent>
      )}
    </Empty>
  )
}

export default AllWateredEmpty
