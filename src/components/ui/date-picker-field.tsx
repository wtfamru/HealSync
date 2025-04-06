import * as React from "react"
import { format, isValid, parse } from "date-fns"
import { CalendarIcon, X } from "lucide-react"
import { Button } from "./button"
import { Input } from "./input"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { CustomCalendar } from "./custom-calendar"
import { cn } from "@/lib/utils"

export interface DatePickerFieldProps {
  value?: Date
  onChange?: (date?: Date) => void
  minDate?: Date
  maxDate?: Date
  disabledDates?: Date[]
  placeholder?: string
  className?: string
  error?: boolean
  disabled?: boolean
}

export function DatePickerField({
  value,
  onChange,
  minDate,
  maxDate,
  disabledDates,
  placeholder = "Select date",
  className,
  error,
  disabled,
}: DatePickerFieldProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState(
    value ? format(value, "dd/MM/yyyy") : ""
  )
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (value) {
      setInputValue(format(value, "dd/MM/yyyy"))
    }
  }, [value])

  const formatDateInput = (input: string) => {
    // Remove any non-digit characters
    const digitsOnly = input.replace(/\D/g, "")
    
    // Format as DD/MM/YYYY
    if (digitsOnly.length <= 2) {
      return digitsOnly
    } else if (digitsOnly.length <= 4) {
      return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`
    } else if (digitsOnly.length <= 8) {
      return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2, 4)}/${digitsOnly.slice(4)}`
    }
    // Limit to 8 digits (DDMMYYYY)
    return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2, 4)}/${digitsOnly.slice(4, 8)}`
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    
    // Allow backspace and deletion
    if (newValue.length < inputValue.length) {
      setInputValue(newValue)
      return
    }

    // Format the input as the user types
    const formattedValue = formatDateInput(newValue)
    setInputValue(formattedValue)

    // Only try to parse complete dates (DD/MM/YYYY)
    if (formattedValue.length === 10) {
      const parsedDate = parse(formattedValue, "dd/MM/yyyy", new Date())
      if (isValid(parsedDate)) {
        // Check if the date components match what was entered
        const enteredDay = formattedValue.slice(0, 2)
        const enteredMonth = formattedValue.slice(3, 5)
        const enteredYear = formattedValue.slice(6, 10)
        
        const formattedDate = format(parsedDate, "dd/MM/yyyy")
        const parsedDay = formattedDate.slice(0, 2)
        const parsedMonth = formattedDate.slice(3, 5)
        const parsedYear = formattedDate.slice(6, 10)

        // Only update if the parsed date matches what was entered
        if (enteredDay === parsedDay && 
            enteredMonth === parsedMonth && 
            enteredYear === parsedYear) {
          onChange?.(parsedDate)
        }
      }
    } else if (formattedValue.length === 0) {
      onChange?.(undefined)
    }
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsOpen(false)
    }
  }

  const handleCalendarSelect = (date: Date) => {
    onChange?.(date)
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const handleClear = () => {
    onChange?.(undefined)
    setInputValue("")
    inputRef.current?.focus()
  }

  const handleCalendarButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

  return (
    <div className={cn("relative", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              placeholder={placeholder}
              maxLength={10}
              className={cn(
                "pr-10",
                error && "border-destructive",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              disabled={disabled}
            />
            <div className="absolute right-0 top-0 h-full flex items-center pr-2 gap-1">
              {inputValue && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-transparent"
                  onClick={handleClear}
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                  <span className="sr-only">Clear date</span>
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-transparent"
                onClick={handleCalendarButtonClick}
              >
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span className="sr-only">Open calendar</span>
              </Button>
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent align="start" className="p-0 w-auto">
          <CustomCalendar
            selected={value}
            onSelect={handleCalendarSelect}
            minDate={minDate}
            maxDate={maxDate}
            disabledDates={disabledDates}
            onClose={() => setIsOpen(false)}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
} 