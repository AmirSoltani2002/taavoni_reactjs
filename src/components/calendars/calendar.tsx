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

export const Calendar22 = ({title, date, setDate}: {title?: string, date: Date | string | undefined, setDate: (date: Date | undefined) => void}) => {
  const [open, setOpen] = React.useState(false)
  
  // Helper function to ensure we have a Date object
  const ensureDate = (d: Date | string | undefined): Date | undefined => {
    if (!d) return undefined;
    if (d instanceof Date) return d;
    try {
      const parsed = new Date(d);
      return isNaN(parsed.getTime()) ? undefined : parsed;
    } catch {
      return undefined;
    }
  };
  
  const dateObj = ensureDate(date);
  
  return (
    <div className="flex flex-col gap-3">
      {title && <Label htmlFor="date" className="px-1 -mb-2.5">
        {title}
      </Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className="w-full justify-between font-normal"
          >
            {dateObj ? dateObj.toLocaleDateString(timeFormat) : "تاریخ انتخابی"}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            defaultMonth={dateObj}
            selected={dateObj}
            onSelect={setDate}
            captionLayout="dropdown"
            className="rounded-lg border shadow-sm"
            endMonth={new Date((new Date()).getFullYear() + 10, 12)}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
