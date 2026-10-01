// Same shape as the WaterLog model in PlantPulse-server (prisma/schema.prisma)
export type WaterLog = {
  id: string
  plantId: string
  date: string // ISO date, e.g. "2026-10-01T09:30:00.000Z"
  plant?: Pick<Plant, "id" | "name" | "species" | "wateringAmount" | "imageUrl"> // GET /api/water-logs includes it
}

// Same shape as the Plant model in PlantPulse-server (prisma/schema.prisma)
export type Plant = {
  id: string
  name: string
  species: string
  wateringAmount: string
  frequency: number // days between waterings
  imageUrl: string | null
  imagePublicId: string | null
  waterLogs?: WaterLog[] // GET /api/plants sends only the last one, GET /api/plants/:id sends all (newest first)
}
