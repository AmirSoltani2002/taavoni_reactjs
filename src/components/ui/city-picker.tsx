import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { shahr } from "iran-cities-json"


interface CityPickerProps {
    provinceId?: number;
    onCityChange?: (city: string) => void;
}

export function CityPicker({provinceId, onCityChange}: CityPickerProps) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")
  const cities = shahr.filter(city => city.ostan === provinceId).map((city) => ({ label: city.name, value: city.name }));
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? cities.find((city) => city.value === value)?.label
            : "شهر را انتخاب کنید..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="انتخاب شهر..." className="h-9" />
          <CommandList>
            <CommandEmpty>شهری پیدا نشد</CommandEmpty>
            <CommandGroup>
              {cities.map((city) => (
                <CommandItem
                  key={city.value}
                  value={city.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue)
                    if (onCityChange) {
                      onCityChange(currentValue === value ? "" : currentValue);
                    }
                    setOpen(false)
                  }}
                >
                  {city.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === city.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
