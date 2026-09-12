"use client"

import * as React from "react"
import { Clock, X, ChevronUp, ChevronDown } from "lucide-react"

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

export interface TimeValue {
  hours: number // 1-12 for 12h, 0-23 for 24h
  minutes: number // 0-59
  period: "AM" | "PM"
}

export function parseTimeString(timeStr?: string | null): TimeValue | null {
  if (!timeStr) return null
  const cleaned = timeStr.trim().replace(/\./g, "").toUpperCase()
  if (!cleaned) return null

  // Match HH:MM AM/PM or HH:MM
  const match = cleaned.match(/^(\d{1,2})(?::(\d{1,2}))?(?:\s*(AM|PM))?$/)
  if (!match) return null

  let hours = parseInt(match[1], 10)
  const minutes = match[2] !== undefined ? parseInt(match[2], 10) : 0
  const periodRaw = match[3] as "AM" | "PM" | undefined

  if (isNaN(hours) || isNaN(minutes) || minutes < 0 || minutes > 59) {
    return null
  }

  let period: "AM" | "PM" = periodRaw || "AM"

  if (!periodRaw) {
    // 24-hour style input without AM/PM
    if (hours >= 12 && hours <= 23) {
      period = "PM"
      hours = hours === 12 ? 12 : hours - 12
    } else if (hours === 0) {
      hours = 12
      period = "AM"
    } else if (hours > 23) {
      return null
    }
  } else {
    // 12-hour format with AM/PM
    if (hours < 1 || hours > 12) return null
  }

  return { hours, minutes, period }
}

export function formatTimeString(
  time: TimeValue | null,
  format: "12h" | "24h" = "12h"
): string {
  if (!time) return ""
  const pad = (n: number) => n.toString().padStart(2, "0")

  if (format === "24h") {
    let h = time.hours
    if (time.period === "PM" && h !== 12) h += 12
    if (time.period === "AM" && h === 12) h = 0
    return `${pad(h)}:${pad(time.minutes)}`
  }

  return `${pad(time.hours)}:${pad(time.minutes)} ${time.period}`
}

export interface TimePickerInputProps {
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
  format?: "12h" | "24h"
}

const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1)
const MINUTES_5 = Array.from({ length: 12 }, (_, i) => i * 5)

export function TimePickerInput({
  label = "Time",
  required = false,
  disabled = false,
  readOnly = false,
  value: controlledValue,
  defaultValue,
  onChange: onValueChange,
  className,
  inputGroupClassName,
  placeholder = "09:00 AM",
  id = "time-picker-input",
  name,
  format = "12h",
}: TimePickerInputProps = {}) {
  const [open, setOpen] = React.useState(false)

  // Resolve initial time from value or defaultValue (no forced 9 AM if empty)
  const initialTime: TimeValue | null = React.useMemo(() => {
    const raw = controlledValue !== undefined ? controlledValue : defaultValue
    return parseTimeString(raw)
  }, [controlledValue, defaultValue])

  const [timeState, setTimeState] = React.useState<TimeValue | null>(initialTime)
  const [inputValue, setInputValue] = React.useState(() => {
    if (controlledValue !== undefined) return controlledValue
    if (defaultValue !== undefined) return defaultValue
    return initialTime ? formatTimeString(initialTime, format) : ""
  })

  // Refs for auto-scrolling
  const selectedHourRef = React.useRef<HTMLButtonElement>(null)
  const selectedMinRef = React.useRef<HTMLButtonElement>(null)

  // Sync external controlled value changes
  React.useEffect(() => {
    if (controlledValue !== undefined && controlledValue !== inputValue) {
      setInputValue(controlledValue)
      const parsed = parseTimeString(controlledValue)
      setTimeState(parsed)
    }
  }, [controlledValue, inputValue])

  // Scroll into view on popover open
  React.useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        selectedHourRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" })
        selectedMinRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" })
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [open])

  // Validation state: is current typed input invalid?
  const isInvalid = React.useMemo(() => {
    const trimmed = inputValue.trim()
    if (!trimmed) return false // Empty checked by required
    return parseTimeString(trimmed) === null
  }, [inputValue])

  // Active time for popover interaction (defaults to current time if unselected)
  const activeTime: TimeValue = React.useMemo(() => {
    if (timeState) return timeState
    const now = new Date()
    let h = now.getHours()
    const period: "AM" | "PM" = h >= 12 ? "PM" : "AM"
    if (h === 0) h = 12
    else if (h > 12) h -= 12
    return { hours: h, minutes: now.getMinutes(), period }
  }, [timeState])

  const updateTime = (newTime: TimeValue) => {
    setTimeState(newTime)
    const formatted = formatTimeString(newTime, format)
    setInputValue(formatted)
    onValueChange?.(formatted)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value
    setInputValue(rawVal)
    onValueChange?.(rawVal)

    if (!rawVal.trim()) {
      setTimeState(null)
      return
    }

    const parsed = parseTimeString(rawVal)
    if (parsed) {
      setTimeState(parsed)
    }
  }

  // Exact current time
  const handleSetNow = () => {
    const now = new Date()
    let h = now.getHours()
    const m = now.getMinutes()
    const period: "AM" | "PM" = h >= 12 ? "PM" : "AM"
    if (h === 0) h = 12
    else if (h > 12) h -= 12

    updateTime({
      hours: h,
      minutes: m,
      period,
    })
    setOpen(false)
  }

  const handleClear = () => {
    setTimeState(null)
    setInputValue("")
    onValueChange?.("")
    setOpen(false)
  }

  // Minute stepper (+1 / -1)
  const adjustMinute = (delta: number) => {
    let m = activeTime.minutes + delta
    let h = activeTime.hours
    let p = activeTime.period

    if (m >= 60) {
      m = 0
      h = h === 12 ? 1 : h + 1
      if (h === 12) p = p === "AM" ? "PM" : "AM"
    } else if (m < 0) {
      m = 59
      h = h === 1 ? 12 : h - 1
      if (h === 11) p = p === "AM" ? "PM" : "AM"
    }

    updateTime({ hours: h, minutes: m, period: p })
  }

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
          {/* Quick Clear Button */}
          {inputValue && !disabled && !readOnly && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear time"
              className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/50 transition-colors cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          )}

          <Popover open={open} onOpenChange={(next) => !disabled && !readOnly && setOpen(next)}>
            <PopoverTrigger
              render={
                <InputGroupButton
                  id={`${id}-clock-btn`}
                  variant="ghost"
                  size="icon-xs"
                  disabled={disabled}
                  aria-label="Select time"
                  className="text-slate-400 hover:text-[#1E1035] hover:bg-slate-200/60 transition-colors cursor-pointer"
                >
                  <Clock className="size-4" />
                  <span className="sr-only">Select time</span>
                </InputGroupButton>
              }
            />
            <PopoverContent
              className="w-[280px] p-3.5 bg-white border border-[#E5E7EB] shadow-2xl rounded-2xl z-50 flex flex-col gap-3"
              align="end"
              alignOffset={-8}
              sideOffset={10}
            >
              {/* Header preview & Fine stepper */}
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#1E1035] tracking-wide">
                    {formatTimeString(activeTime, format)}
                  </span>
                  {/* Minute micro-stepper */}
                  <div className="flex items-center gap-0.5 bg-slate-100 rounded-md p-0.5">
                    <button
                      type="button"
                      onClick={() => adjustMinute(1)}
                      title="Add 1 minute"
                      className="p-0.5 hover:bg-white rounded text-slate-600 hover:text-[#1E1035] transition-colors cursor-pointer"
                    >
                      <ChevronUp className="size-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustMinute(-1)}
                      title="Subtract 1 minute"
                      className="p-0.5 hover:bg-white rounded text-slate-600 hover:text-[#1E1035] transition-colors cursor-pointer"
                    >
                      <ChevronDown className="size-3" />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSetNow}
                  className="text-[11px] font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-md transition-colors cursor-pointer shadow-2xs"
                >
                  Current Time
                </button>
              </div>

              {/* 3 Columns: Hours | Minutes | AM/PM */}
              <div className="grid grid-cols-3 gap-2 text-center">
                {/* Hours Column */}
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Hour
                  </span>
                  <div className="max-h-48 overflow-y-auto flex flex-col gap-1 pr-1 custom-scrollbar">
                    {HOURS_12.map((hour) => {
                      const isSelected = activeTime.hours === hour
                      return (
                        <button
                          key={hour}
                          ref={isSelected ? selectedHourRef : undefined}
                          type="button"
                          onClick={() =>
                            updateTime({ ...activeTime, hours: hour })
                          }
                          className={cn(
                            "h-7 rounded-lg text-xs font-medium transition-all cursor-pointer",
                            isSelected
                              ? "bg-[#1E1035] text-white shadow-xs font-semibold"
                              : "text-slate-700 hover:bg-slate-100 hover:text-[#1E1035]"
                          )}
                        >
                          {hour.toString().padStart(2, "0")}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Minutes Column */}
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Min
                  </span>
                  <div className="max-h-48 overflow-y-auto flex flex-col gap-1 pr-1 custom-scrollbar">
                    {MINUTES_5.map((minute) => {
                      const isSelected = activeTime.minutes === minute
                      return (
                        <button
                          key={minute}
                          ref={isSelected ? selectedMinRef : undefined}
                          type="button"
                          onClick={() =>
                            updateTime({ ...activeTime, minutes: minute })
                          }
                          className={cn(
                            "h-7 rounded-lg text-xs font-medium transition-all cursor-pointer",
                            isSelected
                              ? "bg-[#1E1035] text-white shadow-xs font-semibold"
                              : "text-slate-700 hover:bg-slate-100 hover:text-[#1E1035]"
                          )}
                        >
                          {minute.toString().padStart(2, "0")}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Period Column */}
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Period
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {(["AM", "PM"] as const).map((period) => {
                      const isSelected = activeTime.period === period
                      return (
                        <button
                          key={period}
                          type="button"
                          onClick={() => updateTime({ ...activeTime, period })}
                          className={cn(
                            "h-9 rounded-lg text-xs font-medium transition-all cursor-pointer",
                            isSelected
                              ? "bg-[#1E1035] text-white shadow-xs font-semibold"
                              : "text-slate-700 hover:bg-slate-100 hover:text-[#1E1035]"
                          )}
                        >
                          {period}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Popover Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <button
                  type="button"
                  onClick={handleClear}
                  className="font-medium text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="font-semibold text-[#1E1035] hover:text-purple-800 transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </InputGroupAddon>
      </InputGroup>
    </Field>
  )
}
