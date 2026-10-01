import { useState, type FormEvent } from "react"
import axios from "axios"

// Shadcn Icons
import { Pencil } from "lucide-react"

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
import SpeciesSearch from "@/components/plants/SpeciesSearch"

// Types
import type { Plant } from "@/types/plant"
import type { SpeciesDetails } from "@/types/species"

type EditPlantDialogProps = {
  plant: Plant
  onPlantUpdated?: () => void // e.g. re-fetch the plant
}

function EditPlantDialog({ plant, onPlantUpdated }: EditPlantDialogProps) {

  const [open, setOpen] = useState(false)
  const [name, setName] = useState(plant.name)
  const [species, setSpecies] = useState(plant.species)
  const [wateringAmount, setWateringAmount] = useState(plant.wateringAmount)
  const [frequency, setFrequency] = useState(String(plant.frequency))
  const [image, setImage] = useState<File | null>(null) // only sent if the user picks a new photo
  const [frequencyHint, setFrequencyHint] = useState<string | null>(null) // tells if the frequency came from Perenual
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // fills the form with the current plant data (also discards unsaved changes)
  const resetForm = () => {
    setName(plant.name)
    setSpecies(plant.species)
    setWateringAmount(plant.wateringAmount)
    setFrequency(String(plant.frequency))
    setImage(null)
    setFrequencyHint(null)
    setErrorMessage(null)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    resetForm()
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
      uploadData.append("image", image) // replaces the old photo
    }

    try {
      await service.put(`/plants/${plant.id}`, uploadData)

      onPlantUpdated?.()

      setOpen(false)
    } catch (error) {
      setErrorMessage(
        (axios.isAxiosError(error) && error.response?.data?.errorMessage) ||
          "Something went wrong updating the plant. Please try again."
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
        <Button variant="secondary" size="icon" aria-label={`Edit ${plant.name}`}>
          <Pencil />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              <span className="text-[1.3rem] font-semibold tracking-tight text-foreground">
                Edit {plant.name}
              </span>
            </DialogTitle>
            <DialogDescription>
              Update your plant's details and how often it needs water.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field>
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
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
              <Label htmlFor="edit-species">Species</Label>
              <SpeciesSearch
                id="edit-species"
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
              <Label htmlFor="edit-wateringAmount">Watering amount</Label>
              <Input
                id="edit-wateringAmount"
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
              <Label htmlFor="edit-frequency">Water every (days)</Label>
              <Input
                id="edit-frequency"
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
              <Label htmlFor="edit-image">New photo (optional)</Label>
              <Input
                id="edit-image"
                type="file"
                name="image"
                accept="image/*"
                onChange={(event) => setImage(event.target.files?.[0] ?? null)}
                disabled={isSaving}
              />
              <FieldDescription>Leave it empty to keep the current photo.</FieldDescription>
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
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EditPlantDialog
