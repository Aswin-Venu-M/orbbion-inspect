'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface SelectFieldProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange'> {
  label: string;
  options?: readonly SelectOption[];
  placeholder?: string;
  icon?: React.ReactNode;
  value?: string | number | readonly string[];
  onChange?: (e: { target: { value: string | number | undefined } }) => void;
  disabled?: boolean;
}

export const SelectField = ({ 
  label, 
  required, 
  placeholder = 'Select option', 
  icon, 
  options = [],
  id,
  className = '',
  value,
  disabled = false,
  onChange,
}: SelectFieldProps) => {
  const generatedId = useId();
  const selectId = id || generatedId;

  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Find currently selected option
  const selectedOption = options.find((o) => String(o.value) === String(value));

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

  const handleSelect = (opt: SelectOption) => {
    if (disabled) return;
    onChange?.({ target: { value: opt.value } });
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
        const selIdx = options.findIndex((o) => String(o.value) === String(value));
        setHighlightedIndex(selIdx >= 0 ? selIdx : 0);
        return;
      }
    } else {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < options.length) {
          handleSelect(options[highlightedIndex]);
        }
      } else if (e.key === 'Escape' || e.key === 'Tab') {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    }
  };

  return (
    <div ref={containerRef} className={`relative flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={selectId} className="text-xs font-semibold text-[#1E1035]">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>

      <div className="relative">
        {/* Trigger Button */}
        <button
          type="button"
          id={selectId}
          disabled={disabled}
          onClick={() => {
            if (disabled) return;
            setIsOpen((prev) => !prev);
            const selIdx = options.findIndex((o) => String(o.value) === String(value));
            setHighlightedIndex(selIdx >= 0 ? selIdx : 0);
          }}
          onKeyDown={handleKeyDown}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className={`w-full h-[46px] bg-[#F4F5F8] border border-[#E2E4EB] rounded-[14px] text-sm text-left flex items-center justify-between transition-all outline-none focus:ring-2 focus:ring-[#1E1035]/20 focus:border-[#9723FF]/40 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
            icon ? 'pl-11 pr-3.5' : 'px-4'
          }`}
        >
          {/* Optional Icon */}
          {icon && (
            <div className="absolute left-3.5 text-slate-400 z-10 pointer-events-none flex items-center">
              {icon}
            </div>
          )}

          {/* Selected Label or Placeholder */}
          <span className={`truncate mr-2 ${selectedOption ? 'text-[#190933] font-medium' : 'text-slate-400'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>

          {/* Chevron */}
          <ChevronDown
            size={16}
            className={`text-slate-400 shrink-0 transition-transform duration-200 pointer-events-none ${
              isOpen ? 'rotate-180 text-[#9723FF]' : ''
            }`}
          />
        </button>

        {/* Dropdown Options Popup */}
        {isOpen && !disabled && (
          <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 bg-white rounded-[14px] border border-[#E2E4EB] shadow-xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100">
            <ul
              ref={listRef}
              role="listbox"
              aria-label={label}
              className="max-h-60 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar text-sm"
            >
              {options.length === 0 ? (
                <li className="px-3 py-2 text-xs text-slate-400 text-center">
                  No options available.
                </li>
              ) : (
                options.map((option, idx) => {
                  const isSelected = String(option.value) === String(value);
                  const isHighlighted = idx === highlightedIndex;

                  return (
                    <li
                      key={String(option.value) || idx}
                      role="option"
                      aria-selected={isSelected}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      onClick={() => handleSelect(option)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-[10px] cursor-pointer transition-colors ${
                        isHighlighted
                          ? 'bg-[#F4E8FF] text-[#1E1035]'
                          : isSelected
                          ? 'bg-[#FAF5FF] text-[#9723FF] font-semibold'
                          : 'text-[#190933] hover:bg-[#F4F5F8]'
                      }`}
                    >
                      <span className="truncate">{option.label}</span>
                      {isSelected && (
                        <Check size={16} className="text-[#9723FF] shrink-0 ml-2" />
                      )}
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
