import * as React from "react"
import { Eye, EyeOff } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

type PasswordInputProps = Omit<React.ComponentProps<typeof Input>, "type"> & {
  visibilityLabel?: string
}

function PasswordInput({
  className,
  visibilityLabel = "رمز عبور",
  ...props
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = React.useState(false)
  const action = isVisible ? "پنهان کردن" : "نمایش"

  return (
    <div className="relative">
      <Input
        type={isVisible ? "text" : "password"}
        className={cn("pl-10", className)}
        {...props}
      />
      <button
        type="button"
        aria-label={`${action} ${visibilityLabel}`}
        aria-pressed={isVisible}
        onClick={() => setIsVisible((visible) => !visible)}
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute top-1/2 left-2 flex size-6 -translate-y-1/2 items-center justify-center rounded-sm outline-none transition-colors focus-visible:ring-2"
      >
        {isVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  )
}

export { PasswordInput }
