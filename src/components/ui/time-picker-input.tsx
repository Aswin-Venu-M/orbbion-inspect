"use client"

import * as React from "react"
import { Clock } from "lucide-react"

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
  hours: number // 1-12 for 12h mode
  minutes: number // 0-59
  period: "AM" | "PM"
}

export function parseTimeString(timeStr?: string): TimeValue | null {
  if (!timeStr) return null
  const cleaned = timeStr.trim().toUpperCase()

  const match = cleaned.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/)
  if (!match) return null

  let hours = parseInt(match[1], 10)
  const minutes = parseInt(match[2], 10)
  const periodRaw = match[3] as "AM" | "PM" | undefined

  if (isNaN(hours) || isNaN(minutes) || minutes < 0 || minutes > 59) {
    return null
  }

  let period: "AM" | "PM" = periodRaw || "AM"

  if (!periodRaw) {
    // 24-hour style input
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
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  className?: string
  inputGroupClassName?: string
  placeholder?: string
  id?: string
  format?: "12h" | "24h"
}

const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1)
const MINUTES_5 = Array.from({ length: 12 }, (_, i) => i * 5)

export function TimePickerInput({
  label = "Inspection Time",
  required = false,
  value: controlledValue,
  defaultValue,
  onChange: onValueChange,
  className,
  inputGroupClassName,
  placeholder = "09:00 AM",
  id = "time-picker-input",
  format = "12h",
}: TimePickerInputProps = {}) {
  const [open, setOpen] = React.useState(false)

  const initialTime: TimeValue = React.useMemo(() => {
    const raw = controlledValue ?? defaultValue
    return parseTimeString(raw) || { hours: 9, minutes: 0, period: "AM" }
  }, [controlledValue, defaultValue])

  const [timeState, setTimeState] = React.useState<TimeValue>(initialTime)
  const [inputValue, setInputValue] = React.useState(() => {
    if (controlledValue !== undefined) return controlledValue
    if (defaultValue !== undefined) return defaultValue
    return formatTimeString(initialTime, format)
  })

  // Sync external controlled changes
  React.useEffect(() => {
    if (controlledValue !== undefined && controlledValue !== inputValue) {
      setInputValue(controlledValue)
      const parsed = parseTimeString(controlledValue)
      if (parsed) {
        setTimeState(parsed)
      }
    }
  }, [controlledValue, inputValue])

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

    const parsed = parseTimeString(rawVal)
    if (parsed) {
      setTimeState(parsed)
    }
  }

  const handleSetNow = () => {
    const now = new Date()
    let h = now.getHours()
    const m = Math.round(now.getMinutes() / 5) * 5
    const period: "AM" | "PM" = h >= 12 ? "PM" : "AM"
    if (h === 0) h = 12
    else if (h > 12) h -= 12

    updateTime({
      hours: h,
      minutes: m >= 60 ? 55 : m,
      period,
    })
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
          value={inputValue}
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
                  id="time-picker-btn"
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Select time"
                  className="text-slate-400 hover:text-[#1E1035] hover:bg-slate-200/60 transition-colors cursor-pointer"
                >
                  <Clock className="size-4" />
                  <span className="sr-only">Select time</span>
                </InputGroupButton>
              }
            />
            <PopoverContent
              className="w-[260px] p-3 bg-white border border-[#E5E7EB] shadow-xl rounded-2xl z-50 flex flex-col gap-2.5"
              align="end"
              alignOffset={-8}
              sideOffset={10}
            >
              {/* Header preview & Quick Now */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-1">
                <span className="text-xs font-bold text-[#1E1035] tracking-wide">
                  {formatTimeString(timeState, format)}
                </span>
                <button
                  type="button"
                  onClick={handleSetNow}
                  className="text-[11px] font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded-md transition-colors"
                >
                  Current Time
                </button>
              </div>

              {/* 3 Columns: Hours | Minutes | AM/PM */}
              <div className="grid grid-cols-3 gap-1.5 text-center">
                {/* Hours */}
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Hour
                  </span>
                  <div className="max-h-44 overflow-y-auto flex flex-col gap-1 pr-1 scrollbar-thin">
                    {HOURS_12.map((hour) => {
                      const isSelected = timeState.hours === hour
                      return (
                        <button
                          key={hour}
                          type="button"
                          onClick={() =>
                            updateTime({ ...timeState, hours: hour })
                          }
                          className={cn(
                            "h-7 rounded-lg text-xs font-medium transition-all",
                            isSelected
                              ? "bg-[#1E1035] text-white shadow-sm font-semibold"
                              : "text-slate-700 hover:bg-slate-100"
                          )}
                        >
                          {hour.toString().padStart(2, "0")}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Minutes */}
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Min
                  </span>
                  <div className="max-h-44 overflow-y-auto flex flex-col gap-1 pr-1 scrollbar-thin">
                    {MINUTES_5.map((minute) => {
                      const isSelected = timeState.minutes === minute
                      return (
                        <button
                          key={minute}
                          type="button"
                          onClick={() =>
                            updateTime({ ...timeState, minutes: minute })
                          }
                          className={cn(
                            "h-7 rounded-lg text-xs font-medium transition-all",
                            isSelected
                              ? "bg-[#1E1035] text-white shadow-sm font-semibold"
                              : "text-slate-700 hover:bg-slate-100"
                          )}
                        >
                          {minute.toString().padStart(2, "0")}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* AM / PM */}
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Period
                  </span>
                  <div className="flex flex-col gap-1">
                    {(["AM", "PM"] as const).map((period) => {
                      const isSelected = timeState.period === period
                      return (
                        <button
                          key={period}
                          type="button"
                          onClick={() => updateTime({ ...timeState, period })}
                          className={cn(
                            "h-8 rounded-lg text-xs font-medium transition-all",
                            isSelected
                              ? "bg-[#1E1035] text-white shadow-sm font-semibold"
                              : "text-slate-700 hover:bg-slate-100"
                          )}
                        >
                          {period}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </InputGroupAddon>
      </InputGroup>
    </Field>
  )
}
