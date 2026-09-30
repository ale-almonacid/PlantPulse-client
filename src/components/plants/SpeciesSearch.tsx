import { useEffect, useState } from "react"
import axios from "axios"

// Shadcn Icons
import { Leaf, Loader2, Search } from "lucide-react"

// Services
import service from "@/services/index.services"

// Shadcn UI Imports
import { Input } from "@/components/ui/input"

// What GET /api/species/search returns
type SpeciesResult = {
  id: number
  commonName: string
  scientificName: string | null
  image: string | null
}

// What GET /api/species/:id returns
export type SpeciesDetails = {
  id: number
  species: string
  scientificName: string | null
  watering: string | null
  frequency: number | null
}

type SpeciesSearchProps = {
  id?: string
  value: string // the species text (also editable by hand if the API fails)
  onChange: (value: string) => void
  onSpeciesSelected?: (details: SpeciesDetails) => void // e.g. pre-fill the watering frequency
  disabled?: boolean
}

// ℹ️ Waits until the user stops typing before calling the API (Perenual has a daily request limit)
const SEARCH_DELAY_MS = 500

const getErrorMessage = (error: unknown, fallback: string) =>
  (axios.isAxiosError(error) && error.response?.data?.errorMessage) || fallback

function SpeciesSearch({ id, value, onChange, onSpeciesSelected, disabled }: SpeciesSearchProps) {

  const [results, setResults] = useState<SpeciesResult[]>([])
  const [searchedQuery, setSearchedQuery] = useState<string | null>(null) // the query the results belong to
  const [selectedName, setSelectedName] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const query = value.trim()
  const shouldSearch = query.length >= 2 && query !== selectedName

  useEffect(() => {
    if (!shouldSearch) return

    let isCancelled = false // ignores old responses if the user kept typing

    const timeoutId = setTimeout(async () => {
      setIsSearching(true)
      setErrorMessage(null)
      try {
        const response = await service.get<SpeciesResult[]>("/species/search", { params: { q: query } })
        if (!isCancelled) {
          setResults(response.data)
          setSearchedQuery(query)
        }
      } catch (error) {
        if (!isCancelled) {
          setResults([])
          setErrorMessage(getErrorMessage(error, "Could not search species. You can type it manually."))
        }
      } finally {
        if (!isCancelled) setIsSearching(false)
      }
    }, SEARCH_DELAY_MS)

    return () => {
      isCancelled = true
      clearTimeout(timeoutId)
    }
  }, [query, shouldSearch])

  const handleSelect = async (result: SpeciesResult) => {
    setSelectedName(result.commonName)
    onChange(result.commonName)
    setResults([])
    setErrorMessage(null)

    setIsLoadingDetails(true)
    try {
      const response = await service.get<SpeciesDetails>(`/species/${result.id}`)
      onSpeciesSelected?.(response.data)
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Could not load the watering info. Enter it manually."))
    } finally {
      setIsLoadingDetails(false)
    }
  }

  // hides old results when the search is cleared or a species was picked
  const visibleResults = shouldSearch ? results : []
  const isLoading = isSearching || isLoadingDetails
  const showNoResults = shouldSearch && searchedQuery === query && !isSearching && !errorMessage && results.length === 0

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          type="text"
          value={value}
          onChange={(event) => {
            setSelectedName(null)
            onChange(event.target.value)
          }}
          placeholder="Search e.g. monstera"
          className="pl-8"
          autoComplete="off"
          maxLength={150}
          disabled={disabled}
          required
        />
        {isLoading && (
          <Loader2 className="absolute top-1/2 right-2.5 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {visibleResults.length > 0 && (
        <ul className="max-h-56 overflow-y-auto rounded-md border bg-popover p-1">
          {visibleResults.map((result) => (
            <li key={result.id}>
              <button
                type="button"
                onClick={() => handleSelect(result)}
                className="flex w-full items-center gap-3 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
              >
                {result.image ? (
                  <img src={result.image} alt="" className="size-8 shrink-0 rounded-sm object-cover" />
                ) : (
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-muted">
                    <Leaf className="size-4 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate font-medium">{result.commonName}</p>
                  {result.scientificName && (
                    <p className="truncate text-xs text-muted-foreground italic">{result.scientificName}</p>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {showNoResults && (
        <p className="text-sm text-muted-foreground">No species found. You can keep what you typed.</p>
      )}

      {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
    </div>
  )
}

export default SpeciesSearch
