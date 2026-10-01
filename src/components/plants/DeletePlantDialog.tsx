import { useState, type MouseEvent } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

// Shadcn Icons
import { Trash2Icon } from "lucide-react"

// Services
import service from "@/services/index.services"

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

type DeletePlantDialogProps = {
  plantId: string
  plantName: string
}

function DeletePlantDialog({ plantId, plantName }: DeletePlantDialogProps) {

  const navigate = useNavigate()

  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleOpenChange = (nextOpen: boolean) => {
    if (isDeleting) return // can't close it in the middle of the request
    setErrorMessage(null)
    setOpen(nextOpen)
  }

  const handleDeletePlant = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault() // keeps the dialog open until the request finishes
    setIsDeleting(true)
    setErrorMessage(null)

    try {
      await service.delete(`/plants/${plantId}`) // also deletes its water logs and photo

      navigate("/plants")
    } catch (error) {
      setErrorMessage(
        (axios.isAxiosError(error) && error.response?.data?.errorMessage) ||
          "Something went wrong deleting the plant. Please try again."
      )
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button variant="secondary" size="icon" aria-label={`Delete ${plantName}`}>
          <Trash2Icon />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete {plantName}?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this plant, its photo and its watering history. This action can't be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {errorMessage && <p className="text-center text-sm text-destructive">{errorMessage}</p>}

        <AlertDialogFooter>
          <AlertDialogCancel variant="outline" disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleDeletePlant} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeletePlantDialog
