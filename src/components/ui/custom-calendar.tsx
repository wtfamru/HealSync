import * as React from "react"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from "lucide-react"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO, setMonth, setYear } from "date-fns"
import { Button } from "./button"
import { cn } from "@/lib/utils"

export interface CustomCalendarProps {
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  minDate?: Date
  maxDate?: Date
  disabledDates?: Date[]
  className?: string
  onClose?: () => void
}

type View = "days" | "months" | "years"

const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
]

export function CustomCalendar({
  selected,
  onSelect,
  minDate,
  maxDate,
  disabledDates = [],
  className,
  onClose,
}: CustomCalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(selected || new Date())
  const [focusedDate, setFocusedDate] = React.useState<Date | null>(null)
  const [view, setView] = React.useState<View>("days")
  const [yearRangeStart, setYearRangeStart] = React.useState(
    Math.floor(currentMonth.getFullYear() / 10) * 10
  )

  const calendarDays = React.useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    return eachDayOfInterval({ start, end })
  }, [currentMonth])

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true
    if (maxDate && date > maxDate) return true
    return disabledDates.some((disabledDate) => isSameDay(date, disabledDate))
  }

  const handleKeyDown = (e: React.KeyboardEvent, date: Date) => {
    e.preventDefault()
    switch (e.key) {
      case "ArrowLeft":
        setFocusedDate(new Date(date.setDate(date.getDate() - 1)))
        break
      case "ArrowRight":
        setFocusedDate(new Date(date.setDate(date.getDate() + 1)))
        break
      case "ArrowUp":
        setFocusedDate(new Date(date.setDate(date.getDate() - 7)))
        break
      case "ArrowDown":
        setFocusedDate(new Date(date.setDate(date.getDate() + 7)))
        break
      case "Enter":
        if (!isDateDisabled(date)) onSelect?.(date)
        break
      case "Escape":
        onClose?.()
        break
    }
  }

  const handleDayClick = (date: Date) => {
    if (!isDateDisabled(date)) {
      onSelect?.(date)
    }
  }

  const handleMonthClick = (monthIndex: number) => {
    const newDate = setMonth(currentMonth, monthIndex)
    setCurrentMonth(newDate)
    setView("days")
  }

  const handleYearClick = (year: number) => {
    const newDate = setYear(currentMonth, year)
    setCurrentMonth(newDate)
    setView("months")
  }

  const handleHeaderClick = () => {
    if (view === "days") {
      setView("months")
    } else if (view === "months") {
      setView("years")
    }
  }

  const renderDayView = () => (
    <>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-gray-500 py-1"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date) => {
          const isSelected = selected && isSameDay(date, selected)
          const isDisabled = isDateDisabled(date)
          const isFocused = focusedDate && isSameDay(date, focusedDate)
          const isCurrentMonth = isSameMonth(date, currentMonth)

          return (
            <button
              key={date.toISOString()}
              onClick={() => handleDayClick(date)}
              onKeyDown={(e) => handleKeyDown(e, date)}
              onFocus={() => setFocusedDate(date)}
              disabled={isDisabled}
              className={cn(
                "h-8 w-8 rounded-full text-sm flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary cursor-pointer",
                isSelected && "bg-primary text-primary-foreground",
                !isSelected && !isDisabled && "hover:bg-accent",
                isDisabled && "text-gray-300 cursor-not-allowed",
                !isCurrentMonth && "text-gray-400",
                isToday(date) && !isSelected && "border border-primary",
                isFocused && !isSelected && "bg-accent"
              )}
              aria-selected={isSelected}
              aria-disabled={isDisabled}
              tabIndex={isFocused ? 0 : -1}
            >
              {format(date, "d")}
            </button>
          )
        })}
      </div>
    </>
  )

  const renderMonthView = () => (
    <div className="grid grid-cols-3 gap-2 p-2">
      {months.map((month, index) => (
        <button
          key={month}
          onClick={() => handleMonthClick(index)}
          className={cn(
            "h-10 rounded-lg text-sm flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary hover:bg-accent cursor-pointer",
            currentMonth.getMonth() === index && "bg-primary text-primary-foreground"
          )}
        >
          {month}
        </button>
      ))}
    </div>
  )

  const renderYearView = () => {
    const years = Array.from({ length: 12 }, (_, i) => yearRangeStart + i)
    
    return (
      <div className="grid grid-cols-3 gap-2 p-2">
        {years.map((year) => (
          <button
            key={year}
            onClick={() => handleYearClick(year)}
            className={cn(
              "h-10 rounded-lg text-sm flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary hover:bg-accent cursor-pointer",
              currentMonth.getFullYear() === year && "bg-primary text-primary-foreground"
            )}
          >
            {year}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "p-3 bg-white rounded-lg shadow-lg border border-gray-200",
        className
      )}
      role="dialog"
      aria-label="Calendar"
    >
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => {
            if (view === "days") setCurrentMonth(subMonths(currentMonth, 1))
            else if (view === "years") setYearRangeStart(yearRangeStart - 12)
          }}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label={view === "days" ? "Previous month" : "Previous years"}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={handleHeaderClick}
          className="text-sm font-medium hover:bg-gray-100 rounded-md px-2 py-1 transition-colors"
        >
          {view === "days" && format(currentMonth, "MMMM yyyy")}
          {view === "months" && format(currentMonth, "yyyy")}
          {view === "years" && `${yearRangeStart} - ${yearRangeStart + 11}`}
        </button>
        <button
          onClick={() => {
            if (view === "days") setCurrentMonth(addMonths(currentMonth, 1))
            else if (view === "years") setYearRangeStart(yearRangeStart + 12)
          }}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label={view === "days" ? "Next month" : "Next years"}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {view === "days" && renderDayView()}
      {view === "months" && renderMonthView()}
      {view === "years" && renderYearView()}

      <div className="flex justify-between mt-4 pt-4 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const today = new Date()
            if (!isDateDisabled(today)) {
              onSelect?.(today)
              setCurrentMonth(today)
              setView("days")
            }
          }}
          className="text-xs"
        >
          Today
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSelect?.(undefined)}
          className="text-xs"
        >
          Clear
        </Button>
      </div>
    </div>
  )
} 