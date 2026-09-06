import React, { useId } from 'react';
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from '@/components/ui/combobox';

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
}

export const SelectField = ({ 
  label, 
  required, 
  placeholder, 
  icon, 
  options = [],
  id,
  className,
  value,
  onChange,
  ...props 
}: SelectFieldProps) => {
  const generatedId = useId();
  const selectId = id || generatedId;

  // We find the display label for the currently selected value if any
  const selectedOption = options.find(o => o.value === value);

  return (
    <div className={`flex flex-col gap-1.5 ${className || ""}`}>
      <label htmlFor={selectId} className="text-xs font-semibold text-[#1E1035]">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <Combobox
          selectedValue={value as string | number}
          onSelectedValueChange={(val) => {
            if (onChange) {
              onChange({ target: { value: val } });
            }
          }}
          itemToStringLabel={(itemValue) => {
            const option = options.find((o) => o.value === itemValue);
            return option ? option.label : String(itemValue);
          }}
        >
          <ComboboxInput 
            id={selectId}
            placeholder={placeholder}
            className={`w-full h-[46px] bg-[#F4F5F8] border border-[#E2E4EB] text-sm text-[#190933] rounded-[14px] focus-within:ring-2 focus-within:ring-[#1E1035]/20 transition-all ${icon ? "[&_input]:pl-11 [&_input]:pr-8" : "[&_input]:px-4"}`}
            {...(props as any)}
          >
            {icon && (
              <div className="absolute left-3.5 text-slate-400 z-10 top-1/2 -translate-y-1/2 pointer-events-none">
                {icon}
              </div>
            )}
          </ComboboxInput>
          <ComboboxContent align="start" className="w-(--anchor-width) max-h-[300px]">
            <ComboboxList>
              {options.length === 0 && <ComboboxEmpty>No options available.</ComboboxEmpty>}
              {options.map((option, idx) => (
                <ComboboxItem key={idx} value={option.value}>
                  {option.label}
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
    </div>
  );
};

