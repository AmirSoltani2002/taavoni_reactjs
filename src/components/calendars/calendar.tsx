import * as React from "react"
import { ChevronDownIcon } from "lucide-react"
import { timeFormat } from "../../config"
import { Button } from "../ui/button"
import { Calendar } from "../ui/calendar"
import { Label } from "../ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover"

export const Calendar22 = ({title = 'تاریخ تولد', date, setDate}: {title?: string, date: Date | undefined, setDate: (date: Date | undefined) => void}) => {
  const [open, setOpen] = React.useState(false)
  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor="date" className="px-1 -mb-2.5">
        {title}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className="w-full justify-between font-normal"
          >
            {date ? date.toLocaleDateString(timeFormat) : "تاریخ انتخابی"}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            defaultMonth={date}
            selected={date}
            onSelect={setDate}
            captionLayout="dropdown"
            className="rounded-lg border shadow-sm"
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
