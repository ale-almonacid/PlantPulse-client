import { useState } from "react"
import axios from "axios"

// Shadcn Icons
import { Check, Droplets, Loader2 } from "lucide-react"

// Services
import service from "@/services/index.services"

// Shadcn UI Imports
import { Button } from "@/components/ui/button"

type LogWaterButtonProps = {
  plantId: string
  onWatered?: () => void // e.g. re-fetch the plant(s) so the badge updates
  className?: string
}

function LogWaterButton({ plantId, onWatered, className }: LogWaterButtonProps) {

  const [isSaving, setIsSaving] = useState(false)
  const [isWatered, setIsWatered] = useState(false) // shows "Watered" for a moment after logging
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleLogWater = async () => {
    setIsSaving(true)
    setErrorMessage(null)

    try {
      await service.post("/water-logs", { plantId }) // date defaults to now on the server

      onWatered?.()

      setIsWatered(true)
      setTimeout(() => setIsWatered(false), 2000)
    } catch (error) {
      setErrorMessage(
        (axios.isAxiosError(error) && error.response?.data?.errorMessage) ||
          "Could not log the watering. Please try again."
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className={`flex flex-col gap-2 ${className ?? ""}`}>
      <Button className="w-full bg-water text-water-foreground hover:bg-water/80" onClick={handleLogWater} disabled={isSaving || isWatered}>
        {isSaving ? (
          <><Loader2 className="animate-spin" /> Logging...</>
        ) : isWatered ? (
          <><Check /> Watered</>
        ) : (
          <><Droplets /> Log water</>
        )}
      </Button>
      {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
    </div>
  )
}

export default LogWaterButton
