// What GET /api/species/search returns (one item per species)
export type SpeciesResult = {
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
