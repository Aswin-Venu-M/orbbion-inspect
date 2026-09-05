import React, { useId } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options?: SelectOption[];
  placeholder?: string;
  icon?: React.ReactNode;
}

export const SelectField = ({ 
  label, 
  required, 
  placeholder, 
  icon, 
  options = [],
  id,
  className,
  ...props 
}: SelectFieldProps) => {
  const generatedId = useId();
  const selectId = id || generatedId;

  return (
    <div className={`flex flex-col gap-1.5 ${className || ""}`}>
      <label htmlFor={selectId} className="text-xs font-semibold text-[#1E1035]">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 text-slate-400">
            {icon}
          </div>
        )}
        <select
          id={selectId}
          required={required}
          title={options?.find(o => o.value === props.value)?.label || props.value?.toString() || placeholder}
          className={`w-full h-[46px] bg-[#F4F5F8] border border-[#E2E4EB] text-sm text-[#190933] rounded-[14px] px-4 appearance-none focus:outline-none focus:ring-2 focus:ring-[#1E1035]/20 transition-all ${
            icon ? "pl-11" : ""
          }`}
          {...props}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options?.map((option, idx) => (
            <option key={idx} value={option.value}>{option.label}</option>
          ))}
        </select>
        <div className="absolute right-3.5 text-[#190933] pointer-events-none">
          <ChevronDown size={16} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
};
