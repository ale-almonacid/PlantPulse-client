import { useState, type FormEvent } from "react"
import axios from "axios"
import { format } from "date-fns"

// Shadcn Icons
import { ChevronDownIcon, Pencil } from "lucide-react"

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

import { Calendar } from "@/components/ui/calendar"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// Types
import type { WaterLog } from "@/types/plant"

type EditWateringDialogProps = {
  waterLog: WaterLog
  onWateringUpdated?: () => void // e.g. re-fetch the history
}

// the time input works with a local "09:30" string
const toTimeInput = (date: string) => format(new Date(date), "HH:mm")

function EditWateringDialog({ waterLog, onWateringUpdated }: EditWateringDialogProps) {

  const plantName = waterLog.plant?.name ?? "this plant"

  const [open, setOpen] = useState(false)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [date, setDate] = useState<Date | undefined>(new Date(waterLog.date))
  const [time, setTime] = useState(toTimeInput(waterLog.date))
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // fills the form with the saved date and time (also discards unsaved changes)
  const resetForm = () => {
    setDate(new Date(waterLog.date))
    setTime(toTimeInput(waterLog.date))
    setErrorMessage(null)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    resetForm()
    setOpen(nextOpen)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!date) return

    // picked day + typed time => one date for the server
    const [hours, minutes] = time.split(":").map(Number)
    const newDate = new Date(date)
    newDate.setHours(hours, minutes, 0, 0)
    if (newDate > new Date()) {
      setErrorMessage("A watering can't be in the future.")
      return
    }

    setIsSaving(true)
    setErrorMessage(null)

    try {
      await service.put(`/water-logs/${waterLog.id}`, { date: newDate.toISOString() })

      onWateringUpdated?.()

      setOpen(false)
    } catch (error) {
      setErrorMessage(
        (axios.isAxiosError(error) && error.response?.data?.errorMessage) ||
          "Something went wrong updating the watering. Please try again."
      )
    } finally {
      setIsSaving(false)
    }
  }

  const isFormIncomplete = !date || !time

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Edit watering of ${plantName}`}>
          <Pencil />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              <span className="text-[1.3rem] font-semibold tracking-tight text-foreground">
                Edit watering
              </span>
            </DialogTitle>
            <DialogDescription>
              Change when you watered {plantName}.
            </DialogDescription>
          </DialogHeader>
          {/* shadcn "Date picker with time" */}
          <FieldGroup className="flex-row py-4">
            <Field>
              <FieldLabel htmlFor={`watering-date-${waterLog.id}`}>Date</FieldLabel>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    id={`watering-date-${waterLog.id}`}
                    className="justify-between font-normal"
                    disabled={isSaving}
                  >
                    {date ? format(date, "PPP") : "Select date"}
                    <ChevronDownIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    captionLayout="dropdown"
                    defaultMonth={date}
                    onSelect={(selectedDate) => {
                      setDate(selectedDate)
                      setIsCalendarOpen(false)
                    }}
                  />
                </PopoverContent>
              </Popover>
            </Field>

            <Field className="w-32">
              <FieldLabel htmlFor={`watering-time-${waterLog.id}`}>Time</FieldLabel>
              <Input
                type="time"
                id={`watering-time-${waterLog.id}`}
                value={time}
                onChange={(event) => setTime(event.target.value)}
                disabled={isSaving}
                required
                className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
              />
            </Field>
          </FieldGroup>

          {errorMessage && <p className="pb-4 text-sm text-destructive">{errorMessage}</p>}
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

export default EditWateringDialog
