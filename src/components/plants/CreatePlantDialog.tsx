import { useState, type FormEvent } from "react"
import axios from "axios"

// Shadcn Icons
import { Plus } from "lucide-react"

// Services
import service from "@/services/index.services"

// Shadcn UI Imports
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { Field, FieldDescription, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Components
import SpeciesSearch, { type SpeciesDetails } from "@/components/plants/SpeciesSearch"

type CreatePlantDialogProps = {
  onPlantCreated?: () => void // e.g. re-fetch the plants list
}

function CreatePlantDialog({ onPlantCreated }: CreatePlantDialogProps) {

  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [species, setSpecies] = useState("")
  const [wateringAmount, setWateringAmount] = useState("")
  const [frequency, setFrequency] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [frequencyHint, setFrequencyHint] = useState<string | null>(null) // tells if the frequency came from Perenual
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const resetForm = () => {
    setName("")
    setSpecies("")
    setWateringAmount("")
    setFrequency("")
    setImage(null)
    setFrequencyHint(null)
    setErrorMessage(null)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm()
    }
    setOpen(nextOpen)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    setErrorMessage(null)

    // the server expects form-data because of the optional image
    const uploadData = new FormData()
    uploadData.append("name", name)
    uploadData.append("species", species)
    uploadData.append("wateringAmount", wateringAmount)
    uploadData.append("frequency", frequency)
    if (image) {
      uploadData.append("image", image)
    }

    try {
      await service.post("/plants", uploadData)

      onPlantCreated?.()

      resetForm()
      setOpen(false)
    } catch (error) {
      setErrorMessage(
        (axios.isAxiosError(error) && error.response?.data?.errorMessage) ||
          "Something went wrong creating the plant. Please try again."
      )
    } finally {
      setIsSaving(false)
    }
  }

  // pre-fills the frequency from Perenual (the user can still change it)
  const handleSpeciesSelected = (details: SpeciesDetails) => {
    if (details.frequency) {
      setFrequency(String(details.frequency))
      setFrequencyHint(`Suggested by Perenual for ${details.species}. You can change it.`)
    } else {
      setFrequencyHint(`Perenual has no watering info for ${details.species}. Enter it manually.`)
    }
  }

  const isFormIncomplete =
    !name.trim() || !species.trim() || !wateringAmount.trim() || !frequency

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> Plant
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              <span className="text-[1.3rem] font-semibold tracking-tight text-foreground">
                Add a new plant
              </span>
            </DialogTitle>
            <DialogDescription>
              Add a plant and how often it needs water so PlantPulse can remind you.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                name="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Monty"
                disabled={isSaving}
                maxLength={100}
                required
              />
            </Field>

            <Field>
              <Label htmlFor="species">Species</Label>
              <SpeciesSearch
                id="species"
                value={species}
                onChange={(value) => {
                  setSpecies(value)
                  setFrequencyHint(null) // the hint belonged to the previous species
                }}
                onSpeciesSelected={handleSpeciesSelected}
                disabled={isSaving}
              />
            </Field>

            <Field>
              <Label htmlFor="wateringAmount">Watering amount</Label>
              <Input
                id="wateringAmount"
                type="text"
                name="wateringAmount"
                value={wateringAmount}
                onChange={(event) => setWateringAmount(event.target.value)}
                placeholder="e.g. 500ml"
                disabled={isSaving}
                maxLength={100}
                required
              />
            </Field>

            <Field>
              <Label htmlFor="frequency">Water every (days)</Label>
              <Input
                id="frequency"
                type="number"
                name="frequency"
                min={1}
                step={1}
                value={frequency}
                onChange={(event) => setFrequency(event.target.value)}
                placeholder="e.g. 7"
                disabled={isSaving}
                required
              />
              {frequencyHint && <FieldDescription>{frequencyHint}</FieldDescription>}
            </Field>

            <Field>
              <Label htmlFor="image">Photo (optional)</Label>
              <Input
                id="image"
                type="file"
                name="image"
                accept="image/*"
                onChange={(event) => setImage(event.target.files?.[0] ?? null)}
                disabled={isSaving}
              />
            </Field>

            {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSaving}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSaving || isFormIncomplete}>
              {isSaving ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreatePlantDialog
