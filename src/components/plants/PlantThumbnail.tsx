// Shadcn Icons
import { Leaf } from "lucide-react"

type PlantThumbnailProps = {
  imageUrl?: string | null
  name?: string
}

// Square plant photo for list items (leaf icon if there's no photo)
function PlantThumbnail({ imageUrl, name }: PlantThumbnailProps) {
  return (
    <span className="block size-16 shrink-0">
      {imageUrl ? (
        <img src={imageUrl} alt={name ?? ""} className="size-full rounded-md object-cover" />
      ) : (
        <span className="flex size-full items-center justify-center rounded-md bg-muted">
          <Leaf className="size-6 text-muted-foreground" />
        </span>
      )}
    </span>
  )
}

export default PlantThumbnail
