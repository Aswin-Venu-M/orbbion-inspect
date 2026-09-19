'use client';

import React, { useState, useRef, useEffect, useId, useMemo } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface ComboboxOptionObject {
  label: string;
  value: string;
  hex?: string;
  border?: string;
  description?: string;
}

export type ComboboxOption = string | ComboboxOptionObject;

export interface ComboboxFieldProps {
  label: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: { target: { value: string } }) => void;
  options?: readonly ComboboxOption[];
  placeholder?: string;
  required?: boolean;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  id?: string;
  emptyText?: string;
}

export const ComboboxField = ({
  label,
  value,
  defaultValue = '',
  onChange,
  options = [],
  placeholder,
  required,
  icon,
  rightIcon,
  disabled = false,
  className = '',
  id,
  emptyText = 'No matching suggestions',
}: ComboboxFieldProps) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Normalize options into a consistent structure
  const normalizedOptions: ComboboxOptionObject[] = useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === 'string') {
        return { label: opt, value: opt };
      }
      return opt;
    });
  }, [options]);

  const currentValue = value !== undefined ? value : defaultValue;

  // Filtered options based on user query
  const filteredOptions = useMemo(() => {
    const query = (currentValue || '').trim().toLowerCase();
    if (!query) return normalizedOptions;

    return normalizedOptions.filter(
      (opt) =>
        opt.label.toLowerCase().includes(query) ||
        opt.value.toLowerCase().includes(query)
    );
  }, [normalizedOptions, currentValue]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const activeEl = listRef.current.children[highlightedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleSelect = (opt: ComboboxOptionObject) => {
    onChange?.({ target: { value: opt.value } });
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
    if (!isOpen) {
      setIsOpen(true);
    }
    setHighlightedIndex(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
        e.preventDefault();
        setIsOpen(true);
        setHighlightedIndex(0);
        return;
      }
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredOptions.length - 1
      );
    } else if (e.key === 'Enter') {
      if (isOpen && highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        e.preventDefault();
        handleSelect(filteredOptions[highlightedIndex]);
      } else {
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  // Helper to render matched text with bold highlight
  const renderHighlightedLabel = (labelStr: string, query: string) => {
    if (!query.trim()) return labelStr;
    const lowerQuery = query.toLowerCase();
    const lowerLabel = labelStr.toLowerCase();
    const matchIndex = lowerLabel.indexOf(lowerQuery);

    if (matchIndex === -1) return labelStr;

    const before = labelStr.slice(0, matchIndex);
    const match = labelStr.slice(matchIndex, matchIndex + query.length);
    const after = labelStr.slice(matchIndex + query.length);

    return (
      <>
        {before}
        <span className="font-bold text-[#9723FF] underline decoration-[#9723FF]/30">{match}</span>
        {after}
      </>
    );
  };

  return (
    <div ref={containerRef} className={`relative flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={inputId} className="text-xs font-semibold text-[#1E1035]">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>

      <div className="relative flex items-center">
        {/* Optional Left Icon */}
        {icon && (
          <div className="absolute left-3.5 text-slate-400 z-10 pointer-events-none">
            {icon}
          </div>
        )}

        {/* Input */}
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          value={currentValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onClick={() => {
            if (!isOpen) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className={`w-full h-[46px] bg-[#F4F5F8] border border-[#E2E4EB] text-sm text-[#190933] placeholder-slate-400 rounded-[14px] focus:outline-none focus:ring-2 focus:ring-[#1E1035]/20 focus:border-[#9723FF]/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            icon ? 'pl-11' : 'pl-4'
          } ${rightIcon ? 'pr-16' : 'pr-10'}`}
        />

        {/* Right Icon (e.g. MapPin for Regional Specs) */}
        {rightIcon && (
          <div className="absolute right-9 text-slate-400 pointer-events-none flex items-center">
            {rightIcon}
          </div>
        )}

        {/* Dropdown Chevron Toggle Button */}
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (disabled) return;
            setIsOpen((prev) => !prev);
            inputRef.current?.focus();
          }}
          className="absolute right-2.5 p-1 rounded-md text-slate-400 hover:text-[#1E1035] focus:outline-none transition-transform cursor-pointer"
          aria-label={`Toggle ${label} suggestions`}
        >
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-[#9723FF]' : 'text-slate-400'
            }`}
          />
        </button>
      </div>

      {/* Floating Suggestions Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 bg-white rounded-[14px] border border-[#E2E4EB] shadow-xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100">
          <ul
            ref={listRef}
            role="listbox"
            className="max-h-60 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar text-sm"
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, index) => {
                const isSelected =
                  currentValue.toLowerCase() === opt.value.toLowerCase() ||
                  currentValue.toLowerCase() === opt.label.toLowerCase();
                const isHighlighted = index === highlightedIndex;

                return (
                  <li
                    key={`${opt.value}-${index}`}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onClick={() => handleSelect(opt)}
                    className={`flex items-center justify-between px-3 py-2 rounded-[10px] cursor-pointer transition-colors ${
                      isHighlighted
                        ? 'bg-[#F4E8FF] text-[#1E1035]'
                        : isSelected
                        ? 'bg-[#FAF5FF] text-[#1E1035]'
                        : 'text-[#190933] hover:bg-[#F4F5F8]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {/* Optional Color Dot / Swatch */}
                      {opt.hex && (
                        <span
                          className="size-3.5 rounded-full shrink-0 shadow-2xs"
                          style={{
                            backgroundColor: opt.hex,
                            border: opt.border ? `1px solid ${opt.border}` : '1px solid rgba(0,0,0,0.1)',
                          }}
                        />
                      )}
                      <span className="truncate">
                        {renderHighlightedLabel(opt.label, currentValue)}
                      </span>
                    </div>

                    {isSelected && (
                      <Check size={16} className="text-[#9723FF] shrink-0 ml-2" />
                    )}
                  </li>
                );
              })
            ) : (
              <div className="p-3 text-center">
                <p className="text-xs text-slate-500 mb-2">{emptyText}</p>
                {currentValue.trim() && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      setHighlightedIndex(-1);
                    }}
                    className="w-full text-xs font-semibold py-1.5 px-3 rounded-[8px] bg-[#F4E8FF] text-[#9723FF] hover:bg-[#EBD6FE] transition-colors cursor-pointer text-left flex items-center justify-between"
                  >
                    <span>Use &quot;<span className="font-bold">{currentValue}</span>&quot;</span>
                    <span className="text-[10px] bg-white/70 px-1.5 py-0.5 rounded text-[#9723FF]">Custom</span>
                  </button>
                )}
              </div>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
