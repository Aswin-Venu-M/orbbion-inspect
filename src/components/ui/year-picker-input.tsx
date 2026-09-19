"use client"

import * as React from "react"
import { Calendar, ChevronLeft, ChevronRight, ChevronDown, X, Sparkles, Check } from "lucide-react"

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

export interface YearPickerInputProps {
  label?: string
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
  value?: string | number
  defaultValue?: string | number
  onChange?: (value: string) => void
  className?: string
  inputGroupClassName?: string
  placeholder?: string
  id?: string
  name?: string
  minYear?: number
  maxYear?: number
}

// Quick presets for frequent automotive inspection years
const QUICK_PRESET_OFFSETS = [0, -1, -2, -3, -4] // e.g. current year, -1, -2, -3, -4

export function YearPickerInput({
  label = "Year",
  required = false,
  disabled = false,
  readOnly = false,
  value: controlledValue,
  defaultValue,
  onChange: onValueChange,
  className,
  inputGroupClassName,
  placeholder = "YYYY",
  id = "year-picker-input",
  name,
  minYear = 1900,
  maxYear = new Date().getFullYear() + 1,
}: YearPickerInputProps = {}) {
  const currentCalendarYear = React.useMemo(() => new Date().getFullYear(), [])

  // Normalise controlled or default value
  const initialYearStr = React.useMemo(() => {
    const raw = controlledValue !== undefined ? controlledValue : defaultValue
    if (raw === undefined || raw === null) return ""
    return String(raw).trim()
  }, [controlledValue, defaultValue])

  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState(initialYearStr)
  const [viewMode, setViewMode] = React.useState<"years" | "decades">("years")

  // Selected numeric year or null
  const selectedYear = React.useMemo(() => {
    const trimmed = inputValue.trim()
    if (!trimmed) return null
    const num = parseInt(trimmed, 10)
    return isNaN(num) ? null : num
  }, [inputValue])

  // Starting year for the 12-year grid (groups of 12)
  const [startYear, setStartYear] = React.useState<number>(() => {
    const base = selectedYear || currentCalendarYear
    // Align to 12-year window e.g. 2016-2027 or 2020-2031
    return Math.floor(base / 12) * 12
  })

  // Sync external controlledValue updates
  React.useEffect(() => {
    if (controlledValue !== undefined) {
      const normalized = String(controlledValue).trim()
      setInputValue(normalized)
      const num = parseInt(normalized, 10)
      if (!isNaN(num) && num >= 1000 && num <= 9999) {
        setStartYear(Math.floor(num / 12) * 12)
      }
    }
  }, [controlledValue])

  // When popover opens, re-center view on selected year or current year
  React.useEffect(() => {
    if (open) {
      const base = selectedYear || currentCalendarYear
      setStartYear(Math.floor(base / 12) * 12)
      setViewMode("years")
    }
  }, [open, selectedYear, currentCalendarYear])

  // Validation
  const isInvalid = React.useMemo(() => {
    const trimmed = inputValue.trim()
    if (!trimmed) return false
    const num = parseInt(trimmed, 10)
    if (isNaN(num)) return true
    if (trimmed.length === 4) {
      if (num < minYear || num > maxYear) return true
    } else if (trimmed.length > 4) {
      return true
    }
    return false
  }, [inputValue, minYear, maxYear])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, "").slice(0, 4)
    setInputValue(rawVal)
    onValueChange?.(rawVal)

    if (rawVal.length === 4) {
      const num = parseInt(rawVal, 10)
      if (!isNaN(num) && num >= minYear && num <= maxYear) {
        setStartYear(Math.floor(num / 12) * 12)
      }
    }
  }

  const handleYearSelect = (year: number) => {
    const str = String(year)
    setInputValue(str)
    onValueChange?.(str)
    setOpen(false)
  }

  const handleSetCurrentYear = () => {
    const str = String(currentCalendarYear)
    setInputValue(str)
    onValueChange?.(str)
    setOpen(false)
  }

  const handleClear = () => {
    setInputValue("")
    onValueChange?.("")
    setOpen(false)
  }

  // 12 years array for current page
  const yearsGrid = React.useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => startYear + i)
  }, [startYear])

  const endYear = startYear + 11

  // Decades array for decade jump view (12 decades around current view)
  const decadesList = React.useMemo(() => {
    const centerDecade = Math.floor(startYear / 10) * 10
    const startDecade = Math.max(1940, centerDecade - 50)
    return Array.from({ length: 10 }, (_, i) => startDecade + i * 10)
  }, [startYear])

  // Quick preset years
  const presetYears = React.useMemo(() => {
    return QUICK_PRESET_OFFSETS.map((offset) => currentCalendarYear + offset).filter(
      (y) => y >= minYear && y <= maxYear
    )
  }, [currentCalendarYear, minYear, maxYear])

  return (
    <Field className={className || "w-full"}>
      {label && (
        <FieldLabel htmlFor={id} className="text-xs font-semibold text-[#1E1035]">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </FieldLabel>
      )}
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
          maxLength={4}
          inputMode="numeric"
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
              aria-label="Clear year"
              className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/50 transition-colors cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          )}

          <Popover open={open} onOpenChange={(next) => !disabled && !readOnly && setOpen(next)}>
            <PopoverTrigger
              render={
                <InputGroupButton
                  id={`${id}-year-picker-btn`}
                  variant="ghost"
                  size="icon-xs"
                  disabled={disabled}
                  aria-label="Select year"
                  className="text-slate-400 hover:text-[#1E1035] hover:bg-slate-200/60 transition-colors cursor-pointer"
                >
                  <Calendar className="size-4" />
                  <span className="sr-only">Select year</span>
                </InputGroupButton>
              }
            />
            <PopoverContent
              className="w-[290px] overflow-hidden p-0 bg-white border border-[#E5E7EB] shadow-2xl rounded-2xl z-50 flex flex-col"
              align="end"
              alignOffset={-8}
              sideOffset={8}
            >
              {/* Quick Presets Bar */}
              <div className="px-3 pt-3 pb-2 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                  <span className="flex items-center gap-1">
                    <Sparkles className="size-3 text-purple-600" />
                    Quick Pick
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Recent years</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {presetYears.map((preset) => {
                    const isPresetSelected = selectedYear === preset
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleYearSelect(preset)}
                        className={cn(
                          "px-2 py-0.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                          isPresetSelected
                            ? "bg-[#1E1035] text-white shadow-xs"
                            : "bg-white border border-slate-200 text-slate-700 hover:border-purple-300 hover:bg-purple-50/50 hover:text-purple-900"
                        )}
                      >
                        {preset}
                        {preset === currentCalendarYear && (
                          <span className="ml-1 text-[9px] text-purple-400 font-normal">Now</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Navigation Header */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
                <button
                  type="button"
                  aria-label="Previous 12 years"
                  onClick={() => {
                    if (viewMode === "decades") {
                      setStartYear((prev) => Math.max(1900, prev - 50))
                    } else {
                      setStartYear((prev) => Math.max(1900, prev - 12))
                    }
                  }}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-[#1E1035] transition-colors cursor-pointer"
                >
                  <ChevronLeft className="size-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode((prev) => (prev === "years" ? "decades" : "years"))}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-[#1E1035] hover:bg-purple-50 hover:text-purple-800 transition-colors cursor-pointer group"
                >
                  <span>
                    {viewMode === "years" ? `${startYear} – ${endYear}` : "Select Decade"}
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-3.5 text-slate-400 group-hover:text-purple-600 transition-transform duration-200",
                      viewMode === "decades" && "rotate-180"
                    )}
                  />
                </button>

                <button
                  type="button"
                  aria-label="Next 12 years"
                  onClick={() => {
                    if (viewMode === "decades") {
                      setStartYear((prev) => Math.min(2100, prev + 50))
                    } else {
                      setStartYear((prev) => Math.min(2100, prev + 12))
                    }
                  }}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-[#1E1035] transition-colors cursor-pointer"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>

              {/* Body: 12-Year Grid OR Decade Jump List */}
              <div className="p-3">
                {viewMode === "years" ? (
                  <div className="grid grid-cols-3 gap-2">
                    {yearsGrid.map((yr) => {
                      const isSelected = selectedYear === yr
                      const isCurrent = yr === currentCalendarYear
                      const isOutOfRange = yr < minYear || yr > maxYear

                      return (
                        <button
                          key={yr}
                          type="button"
                          disabled={isOutOfRange}
                          onClick={() => handleYearSelect(yr)}
                          className={cn(
                            "relative h-10 rounded-xl text-xs font-semibold flex items-center justify-center transition-all cursor-pointer select-none",
                            isSelected
                              ? "bg-gradient-to-br from-[#1E1035] to-[#3B1E6D] text-white shadow-md shadow-[#1E1035]/20 font-bold scale-[1.02]"
                              : isCurrent
                              ? "bg-purple-50 text-purple-700 font-bold border border-purple-200 hover:bg-purple-100/80"
                              : "text-slate-700 hover:bg-slate-100 hover:text-[#1E1035] active:scale-95",
                            isOutOfRange && "opacity-30 cursor-not-allowed pointer-events-none text-slate-300"
                          )}
                        >
                          {yr}
                          {isCurrent && !isSelected && (
                            <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-purple-600" />
                          )}
                          {isSelected && (
                            <span className="absolute top-1 right-1.5">
                              <Check className="size-2.5 text-purple-300 stroke-[3]" />
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  // Decades Jump Grid
                  <div className="grid grid-cols-2 gap-2">
                    {decadesList.map((decade) => {
                      const isCurrentDecade =
                        Math.floor(startYear / 10) * 10 === decade ||
                        Math.floor(currentCalendarYear / 10) * 10 === decade

                      return (
                        <button
                          key={decade}
                          type="button"
                          onClick={() => {
                            setStartYear(decade)
                            setViewMode("years")
                          }}
                          className={cn(
                            "h-9 px-2 rounded-xl text-xs font-semibold flex items-center justify-between border transition-all cursor-pointer",
                            isCurrentDecade
                              ? "bg-purple-50 border-purple-300 text-purple-900 font-bold"
                              : "bg-white border-slate-200 text-slate-700 hover:border-purple-200 hover:bg-slate-50 hover:text-[#1E1035]"
                          )}
                        >
                          <span>{decade}s</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {decade}–{decade + 9}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
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
                <button
                  type="button"
                  onClick={handleSetCurrentYear}
                  className="font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer shadow-2xs"
                >
                  Current ({currentCalendarYear})
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </InputGroupAddon>
      </InputGroup>
    </Field>
  )
}
