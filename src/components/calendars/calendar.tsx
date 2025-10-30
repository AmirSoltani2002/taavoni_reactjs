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
import { cn } from "@/lib/utils";

export const Calendar22 = ({title, date, setDate, className}: {title?: string, date: Date | string | undefined, setDate: (date: Date | undefined) => void, className?: string}) => {
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
    <div className={cn("flex flex-col gap-3", className)}>
      {title && <Label htmlFor="date" className="px-1 -mb-2.5">
        {title}
      </Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className={cn("w-full justify-between font-normal text-gray-500")}
          >
            {dateObj ? dateObj.toLocaleDateString(timeFormat) : "تاریخ انتخابی"}
            <ChevronDownIcon className={cn("text-gray-500", className)} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className={cn("w-auto overflow-hidden p-0", className)} align="start">
          <Calendar
            mode="single"
            defaultMonth={dateObj}
            selected={dateObj}
            onSelect={setDate}
            captionLayout="dropdown"
            className={cn("rounded-lg border shadow-sm", className)}
            endMonth={new Date((new Date()).getFullYear() + 10, 12)}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
