import { useEffect, useMemo, useState } from "react"
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

interface Calendar22Props {
  title?: string
  date: Date | string | undefined
  setDate: (date: Date | undefined) => void
  className?: string
  maxDate?: Date
}

export const Calendar22 = ({
  title,
  date,
  setDate,
  className,
  maxDate,
}: Calendar22Props) => {
  const [open, setOpen] = useState(false)
  
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
  
  // Memoize to avoid creating a new Date each render which was causing
  // useEffect to fire repeatedly and trigger a render loop when used as a controlled input
  const dateObj = useMemo(() => ensureDate(date), [date]);
  
  // Internal state to track selected date for immediate UI update
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(dateObj);
  
  // Update internal state when prop changes
  useEffect(() => {
    setSelectedDate(dateObj);
  }, [dateObj]);
  
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {title && <Label htmlFor="date" className="px-1 -mb-2.5">
        {title}
      </Label>}
      <Popover open={open} onOpenChange={setOpen} modal={false}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            type="button"
            className={cn("w-full justify-between font-normal text-gray-500")}
          >
            {selectedDate ? selectedDate.toLocaleDateString(timeFormat) : "تاریخ انتخابی"}
            <ChevronDownIcon className={cn("text-gray-500", className)} />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className={cn("w-auto overflow-hidden p-0 !z-[10000]", className)} 
          align="start"
          style={{ zIndex: 10000, pointerEvents: 'auto' }}
          onInteractOutside={(e) => {
            // Allow closing when clicking outside, but prevent closing when clicking on dialog overlay
            const target = e.target as HTMLElement;
            if (target.closest('[data-slot="dialog-overlay"]')) {
              e.preventDefault();
            }
          }}
          onPointerDownOutside={(e) => {
            // Prevent closing when clicking on dialog overlay
            const target = e.target as HTMLElement;
            if (target.closest('[data-slot="dialog-overlay"]')) {
              e.preventDefault();
            }
          }}
        >
          <div style={{ pointerEvents: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <Calendar
              mode="single"
              defaultMonth={selectedDate || dateObj}
              selected={selectedDate}
              onSelect={(date) => {
                setSelectedDate(date);
                setDate(date);
                setOpen(false);
              }}
              captionLayout="dropdown"
              className={cn("rounded-lg border shadow-sm", className)}
              endMonth={maxDate ?? new Date((new Date()).getFullYear() + 10, 12)}
              disabled={maxDate ? { after: maxDate } : undefined}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
