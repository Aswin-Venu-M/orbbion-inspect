"use client"

import * as React from "react"
import { CalendarIcon, X } from "lucide-react"

import { Calendar } from "@/components/ui/calendar"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export type DateFormatType = "DD-MM-YYYY" | "YYYY-MM-DD" | "short" | "long"

export function isValidDate(date: Date | undefined | null): date is Date {
  if (!date) return false
  return date instanceof Date && !isNaN(date.getTime())
}

export function parseDate(dateStr: string | undefined | null): Date | undefined {
  if (!dateStr) return undefined
  const cleaned = dateStr.trim()
  if (!cleaned) return undefined

  // Match DD-MM-YYYY or DD/MM/YYYY or DD.MM.YYYY
  const dmyMatch = cleaned.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/)
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10)
    const month = parseInt(dmyMatch[2], 10)
    const year = parseInt(dmyMatch[3], 10)

    // Range check month and day
    if (month < 1 || month > 12 || day < 1 || day > 31) return undefined

    const d = new Date(year, month - 1, day)
    // Strict calendar boundary check (e.g. catches 31-02-2025 or 29-02-2025 in non-leap year)
    if (
      d.getFullYear() === year &&
      d.getMonth() === month - 1 &&
      d.getDate() === day
    ) {
      return d
    }
    return undefined
  }

  // Match YYYY-MM-DD (ISO style) using local time to prevent UTC day shift
  const ymdMatch = cleaned.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/)
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10)
    const month = parseInt(ymdMatch[2], 10)
    const day = parseInt(ymdMatch[3], 10)

    if (month < 1 || month > 12 || day < 1 || day > 31) return undefined

    const d = new Date(year, month - 1, day)
    if (
      d.getFullYear() === year &&
      d.getMonth() === month - 1 &&
      d.getDate() === day
    ) {
      return d
    }
    return undefined
  }

  // Fallback for text strings like "Aug 06, 2025" or "August 6, 2025" or "06 Aug 2025"
  const parsed = new Date(cleaned)
  if (isValidDate(parsed)) {
    return parsed
  }

  return undefined
}

export function formatDate(
  date: Date | undefined | null,
  format: DateFormatType = "DD-MM-YYYY"
): string {
  if (!date || !isValidDate(date)) return ""

  const day = date.getDate().toString().padStart(2, "0")
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const year = date.getFullYear()

  switch (format) {
    case "DD-MM-YYYY":
      return `${day}-${month}-${year}`
    case "YYYY-MM-DD":
      return `${year}-${month}-${day}`
    case "short":
      return date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    case "long":
      return date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    default:
      return `${day}-${month}-${year}`
  }
}

export interface DatePickerInputProps {
  label?: string
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  className?: string
  inputGroupClassName?: string
  placeholder?: string
  id?: string
  name?: string
  dateFormat?: DateFormatType
  monthFormat?: "long" | "short"
  minDate?: Date
  maxDate?: Date
}

export function DatePickerInput({
  label = "Date",
  required = false,
  disabled = false,
  readOnly = false,
  value: controlledValue,
  defaultValue,
  onChange: onValueChange,
  className,
  inputGroupClassName,
  placeholder = "DD-MM-YYYY",
  id = "date-picker-input",
  name,
  dateFormat,
  monthFormat,
  minDate,
  maxDate,
}: DatePickerInputProps = {}) {
  const [open, setOpen] = React.useState(false)

  // Determine effective date format: if dateFormat given use it;
  // else if monthFormat given map it; otherwise default to DD-MM-YYYY
  const effectiveFormat: DateFormatType = React.useMemo(() => {
    if (dateFormat) return dateFormat
    if (monthFormat === "short") return "short"
    if (monthFormat === "long") return "long"
    if (placeholder?.toUpperCase().includes("DD-MM-YYYY")) return "DD-MM-YYYY"
    if (placeholder?.toUpperCase().includes("YYYY-MM-DD")) return "YYYY-MM-DD"
    return "DD-MM-YYYY"
  }, [dateFormat, monthFormat, placeholder])

  // Parse initial date from controlled value or defaultValue (no forced June 2025 fallback!)
  const initialDate = React.useMemo(() => {
    const target = controlledValue !== undefined ? controlledValue : defaultValue
    return parseDate(target)
  }, [controlledValue, defaultValue])

  const [date, setDate] = React.useState<Date | undefined>(initialDate)
  const [month, setMonth] = React.useState<Date>(date || new Date())
  
  const [inputValue, setInputValue] = React.useState(() => {
    if (controlledValue !== undefined) return controlledValue
    if (defaultValue !== undefined) return defaultValue
    return date ? formatDate(date, effectiveFormat) : ""
  })

  // Sync when controlledValue changes externally
  React.useEffect(() => {
    if (controlledValue !== undefined && controlledValue !== inputValue) {
      setInputValue(controlledValue)
      const parsed = parseDate(controlledValue)
      setDate(parsed)
      if (parsed) {
        setMonth(parsed)
      }
    }
  }, [controlledValue, inputValue])

  // Validation state: is the current typed input invalid?
  const isInvalid = React.useMemo(() => {
    const trimmed = inputValue.trim()
    if (!trimmed) return false // Empty is not format-invalid (required handles presence)
    const parsed = parseDate(trimmed)
    if (!parsed) return true
    if (minDate && parsed < minDate) return true
    if (maxDate && parsed > maxDate) return true
    return false
  }, [inputValue, minDate, maxDate])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value
    setInputValue(rawVal)
    onValueChange?.(rawVal)

    if (!rawVal.trim()) {
      setDate(undefined)
      return
    }

    const parsed = parseDate(rawVal)
    if (parsed) {
      // Check bounds
      if ((!minDate || parsed >= minDate) && (!maxDate || parsed <= maxDate)) {
        setDate(parsed)
        setMonth(parsed)
      }
    }
  }

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return
    setDate(selectedDate)
    const formatted = formatDate(selectedDate, effectiveFormat)
    setInputValue(formatted)
    onValueChange?.(formatted)
    setOpen(false)
  }

  const handleSetToday = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    setDate(today)
    setMonth(today)
    const formatted = formatDate(today, effectiveFormat)
    setInputValue(formatted)
    onValueChange?.(formatted)
    setOpen(false)
  }

  const handleClear = () => {
    setDate(undefined)
    setInputValue("")
    onValueChange?.("")
    setOpen(false)
  }

  // Disabled predicate for react-day-picker
  const isDayDisabled = React.useCallback(
    (checkDate: Date) => {
      if (minDate && checkDate < minDate) return true
      if (maxDate && checkDate > maxDate) return true
      return false
    },
    [minDate, maxDate]
  )

  return (
    <Field className={className || "w-full"}>
      <FieldLabel htmlFor={id} className="text-xs font-semibold text-[#1E1035]">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </FieldLabel>
      <InputGroup
        className={cn(
          "h-[46px] bg-[#F4F5F8] border border-[#E2E4EB] rounded-[14px] pl-3.5 pr-2 focus-within:ring-2 focus-within:ring-[#1E1035]/20 focus-within:border-transparent transition-all",
          isInvalid && "border-red-400 focus-within:ring-red-500/20",
          disabled && "opacity-50 pointer-events-none",
          inputGroupClassName
        )}
      >
        <InputGroupInput
          id={id}
          name={name}
          disabled={disabled}
          readOnly={readOnly}
          value={inputValue}
          placeholder={placeholder}
          aria-invalid={isInvalid}
          className="h-full px-0 text-sm text-[#190933] placeholder:text-slate-400 font-normal focus:outline-none"
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault()
              if (!disabled && !readOnly) setOpen(true)
            } else if (e.key === "Escape") {
              setOpen(false)
            }
          }}
        />

        <InputGroupAddon align="inline-end" className="flex items-center gap-1">
          {/* Quick Clear Button when text is present */}
          {inputValue && !disabled && !readOnly && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear date"
              className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/50 transition-colors cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          )}

          <Popover open={open} onOpenChange={(next) => !disabled && !readOnly && setOpen(next)}>
            <PopoverTrigger
              render={
                <InputGroupButton
                  id={`${id}-calendar-btn`}
                  variant="ghost"
                  size="icon-xs"
                  disabled={disabled}
                  aria-label="Select date"
                  className="text-slate-400 hover:text-[#1E1035] hover:bg-slate-200/60 transition-colors cursor-pointer"
                >
                  <CalendarIcon className="size-4" />
                  <span className="sr-only">Select date</span>
                </InputGroupButton>
              }
            />
            <PopoverContent
              className="w-auto overflow-hidden p-0 bg-white border border-[#E5E7EB] shadow-2xl rounded-2xl z-50 flex flex-col"
              align="end"
              alignOffset={-8}
              sideOffset={10}
            >
              <div className="p-1">
                <Calendar
                  mode="single"
                  selected={date}
                  month={month}
                  onMonthChange={setMonth}
                  onSelect={handleDateSelect}
                  disabled={minDate || maxDate ? isDayDisabled : undefined}
                />
              </div>

              {/* Popover Footer with Quick Actions */}
              <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50/80 border-t border-slate-100 text-xs">
                <button
                  type="button"
                  onClick={handleClear}
                  className="font-medium text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
                >
                  Clear
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSetToday}
                    className="font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer shadow-2xs"
                  >
                    Today
                  </button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </InputGroupAddon>
      </InputGroup>
    </Field>
  )
}
