import { useEffect, useState } from "react"
import axios from "axios"

// Services
import service from "@/services/index.services"

// Types
import type { SpeciesResult } from "@/types/species"

// Components
import SpeciesItem from "@/components/plants/SpeciesItem"

type SpeciesInfoProps = {
  species: string // the plant's species name, e.g. "Swiss cheese plant"
}

// ℹ️ The plant only stores the species name, so it searches Perenual by that name
// and shows the result with the same name (or the first one if none matches exactly)
function SpeciesInfo({ species }: SpeciesInfoProps) {

  const [match, setMatch] = useState<SpeciesResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let isCancelled = false

    const getSpecies = async () => {
      try {
        const response = await service.get<SpeciesResult[]>("/species/search", { params: { q: species } })
        if (isCancelled) return

        const results = response.data
        const exactMatch = results.find(
          (result) => result.commonName.toLowerCase() === species.trim().toLowerCase()
        )
        setMatch(exactMatch ?? results[0] ?? null)
      } catch (error) {
        if (!isCancelled) {
          setErrorMessage(
            (axios.isAxiosError(error) && error.response?.data?.errorMessage) ||
              "Could not load the species info."
          )
        }
      } finally {
        if (!isCancelled) setIsLoading(false)
      }
    }

    getSpecies()

    return () => {
      isCancelled = true
    }
  }, [species])

  if (isLoading) return <p className="text-sm text-muted-foreground">Looking up {species}...</p>
  if (errorMessage) return <p className="text-sm text-destructive">{errorMessage}</p>
  if (!match) return <p className="text-sm text-muted-foreground">Perenual has no info about {species}.</p>

  return <SpeciesItem species={match} size="lg" />
}

export default SpeciesInfo
