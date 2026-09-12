"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"

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

function formatDate(date: Date | undefined, monthFormat: "long" | "short" = "long") {
  if (!date) {
    return ""
  }

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: monthFormat,
    year: "numeric",
  })
}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false
  }
  return !isNaN(date.getTime())
}

function parseDate(dateStr: string | undefined): Date | undefined {
  if (!dateStr) return undefined
  // Handle DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = dateStr.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/)
  if (dmyMatch) {
    const [, day, month, year] = dmyMatch
    const d = new Date(Number(year), Number(month) - 1, Number(day))
    if (isValidDate(d)) return d
  }
  const parsed = new Date(dateStr)
  return isValidDate(parsed) ? parsed : undefined
}

export interface DatePickerInputProps {
  label?: string
  required?: boolean
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  className?: string
  inputGroupClassName?: string
  placeholder?: string
  id?: string
  monthFormat?: "long" | "short"
}

export function DatePickerInput({
  label = "Subscription Date",
  required = false,
  value: controlledValue,
  defaultValue,
  onChange: onValueChange,
  className,
  inputGroupClassName,
  placeholder = "June 01, 2025",
  id = "date-required",
  monthFormat = "long",
}: DatePickerInputProps = {}) {
  const [open, setOpen] = React.useState(false)

  const initialDate = React.useMemo(() => {
    if (controlledValue !== undefined && controlledValue !== "") {
      return parseDate(controlledValue) || new Date("2025-06-01")
    }
    if (defaultValue !== undefined && defaultValue !== "") {
      return parseDate(defaultValue) || new Date("2025-06-01")
    }
    return new Date("2025-06-01")
  }, [controlledValue, defaultValue])

  const [date, setDate] = React.useState<Date | undefined>(initialDate)
  const [month, setMonth] = React.useState<Date | undefined>(date)
  const [value, setValue] = React.useState(() => {
    if (controlledValue !== undefined) return controlledValue
    if (defaultValue !== undefined) return defaultValue
    return formatDate(date, monthFormat)
  })

  // Sync when controlled value changes externally
  React.useEffect(() => {
    if (controlledValue !== undefined && controlledValue !== value) {
      setValue(controlledValue)
      const parsed = parseDate(controlledValue)
      if (parsed) {
        setDate(parsed)
        setMonth(parsed)
      }
    }
  }, [controlledValue, value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    setValue(inputValue)
    onValueChange?.(inputValue)

    const parsedDate = parseDate(inputValue)
    if (isValidDate(parsedDate)) {
      setDate(parsedDate)
      setMonth(parsedDate)
    }
  }

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    const formatted = formatDate(selectedDate, monthFormat)
    setValue(formatted)
    onValueChange?.(formatted)
    setOpen(false)
  }

  return (
    <Field className={className || "mx-auto w-48"}>
      <FieldLabel htmlFor={id} className="text-xs font-semibold text-[#1E1035]">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </FieldLabel>
      <InputGroup
        className={cn(
          "h-[46px] bg-[#F4F5F8] border border-[#E2E4EB] rounded-[14px] pl-3.5 pr-2 focus-within:ring-2 focus-within:ring-[#1E1035]/20 focus-within:border-transparent transition-all",
          inputGroupClassName
        )}
      >
        <InputGroupInput
          id={id}
          value={value}
          placeholder={placeholder}
          className="h-full px-0 text-sm text-[#190933] placeholder:text-slate-400 font-normal"
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault()
              setOpen(true)
            }
          }}
        />
        <InputGroupAddon align="inline-end">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
              render={
                <InputGroupButton
                  id="date-picker"
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Select date"
                  className="text-slate-400 hover:text-[#1E1035] hover:bg-slate-200/60 transition-colors cursor-pointer"
                >
                  <CalendarIcon className="size-4" />
                  <span className="sr-only">Select date</span>
                </InputGroupButton>
              }
            />
            <PopoverContent
              className="w-auto overflow-hidden p-0 bg-white border border-[#E5E7EB] shadow-xl rounded-2xl z-50"
              align="end"
              alignOffset={-8}
              sideOffset={10}
            >
              <Calendar
                mode="single"
                selected={date}
                month={month}
                onMonthChange={setMonth}
                onSelect={handleDateSelect}
              />
            </PopoverContent>
          </Popover>
        </InputGroupAddon>
      </InputGroup>
    </Field>
  )
}
