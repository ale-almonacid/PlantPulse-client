import { useState, type MouseEvent } from "react"
import axios from "axios"
import { format } from "date-fns"

// Shadcn Icons
import { Trash2Icon } from "lucide-react"

// Services
import service from "@/services/index.services"

// Types
import type { WaterLog } from "@/types/plant"

// Shadcn UI Imports
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

type DeleteWateringDialogProps = {
  waterLog: WaterLog
  onWateringDeleted?: () => void // e.g. re-fetch the history
}

function DeleteWateringDialog({ waterLog, onWateringDeleted }: DeleteWateringDialogProps) {

  const plantName = waterLog.plant?.name ?? "this plant"

  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleOpenChange = (nextOpen: boolean) => {
    if (isDeleting) return // can't close it in the middle of the request
    setErrorMessage(null)
    setOpen(nextOpen)
  }

  const handleDeleteWatering = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault() // keeps the dialog open until the request finishes
    setIsDeleting(true)
    setErrorMessage(null)

    try {
      await service.delete(`/water-logs/${waterLog.id}`)

      setOpen(false)
      onWateringDeleted?.()
    } catch (error) {
      setErrorMessage(
        (axios.isAxiosError(error) && error.response?.data?.errorMessage) ||
          "Something went wrong deleting the watering. Please try again."
      )
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Delete watering of ${plantName}`}>
          <Trash2Icon />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete watering?</AlertDialogTitle>
          <AlertDialogDescription>
            This will delete the watering of {plantName} on {format(new Date(waterLog.date), "d MMM yyyy 'at' HH:mm")}. This action can't be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {errorMessage && <p className="text-center text-sm text-destructive">{errorMessage}</p>}

        <AlertDialogFooter>
          <AlertDialogCancel variant="outline" disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleDeleteWatering} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteWateringDialog
