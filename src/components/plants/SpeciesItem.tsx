// Shadcn Icons
import { Leaf } from "lucide-react"

// Types
import type { SpeciesResult } from "@/types/species"

type SpeciesItemProps = {
  species: SpeciesResult
  size?: "sm" | "lg" // sm: search results, lg: plant details page
}

// Perenual picture + common and scientific name
function SpeciesItem({ species, size = "sm" }: SpeciesItemProps) {
  const imageSize = size === "lg" ? "size-16 rounded-md" : "size-8 rounded-sm"

  return (
    <div className="flex min-w-0 items-center gap-3">
      {species.image ? (
        <img src={species.image} alt="" className={`${imageSize} shrink-0 object-cover`} />
      ) : (
        <div className={`${imageSize} flex shrink-0 items-center justify-center bg-muted`}>
          <Leaf className="size-4 text-muted-foreground" />
        </div>
      )}
      <div className="min-w-0">
        <p className={`truncate font-medium ${size === "lg" ? "text-base" : "text-sm"}`}>{species.commonName}</p>
        {species.scientificName && (
          <p className={`truncate text-muted-foreground italic ${size === "lg" ? "text-sm" : "text-xs"}`}>
            {species.scientificName}
          </p>
        )}
      </div>
    </div>
  )
}

export default SpeciesItem
