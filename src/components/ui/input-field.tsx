import React, { useId, useState, useEffect, useRef, useCallback } from 'react';

export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  rightText?: React.ReactNode;
}

export const InputField = ({ 
  label, 
  required, 
  placeholder, 
  icon, 
  rightIcon, 
  rightText, 
  type = "text", 
  value, 
  defaultValue, 
  onChange, 
  className,
  id,
  ...props
}: InputFieldProps) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  // Local state for immediate UI feedback
  const [localValue, setLocalValue] = useState(value ?? defaultValue ?? '');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const pendingEventRef = useRef<React.ChangeEvent<HTMLInputElement> | null>(null);

  // Sync with external value changes (e.g. form reset or parent override)
  useEffect(() => {
    if (value !== undefined && value !== localValue) {
      setLocalValue(value);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setLocalValue(newVal);

    if (onChange) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      
      // Create a mock event to pass to the parent's onChange safely after delay
      const syntheticEvent = {
        ...e,
        target: { ...e.target, value: newVal },
        currentTarget: { ...e.currentTarget, value: newVal }
      } as React.ChangeEvent<HTMLInputElement>;
      pendingEventRef.current = syntheticEvent;
      
      debounceRef.current = setTimeout(() => {
        onChange(syntheticEvent);
        pendingEventRef.current = null;
        debounceRef.current = null;
      }, 400);
    }
  }, [onChange]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
      if (pendingEventRef.current && onChange) {
        onChange(pendingEventRef.current);
        pendingEventRef.current = null;
      }
    }
    props.onBlur?.(e);
  }, [onChange, props]);

  // Clean up timeout
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className={`flex flex-col gap-1.5 ${className || ""}`}>
      <label htmlFor={inputId} className="text-xs font-semibold text-[#1E1035]">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 text-slate-400">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          type={type}
          defaultValue={defaultValue}
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          className={`w-full h-[46px] bg-[#F4F5F8] border border-[#E2E4EB] text-sm text-[#190933] placeholder-slate-400 rounded-[14px] px-4 focus:outline-none focus:ring-2 focus:ring-[#1E1035]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            icon ? "pl-11" : ""
          } ${rightIcon || rightText ? "pr-12" : ""}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3.5 text-slate-400">
            {rightIcon}
          </div>
        )}
        {rightText && (
          <div className="absolute right-4 text-xs font-semibold text-[#190933]">
            {rightText}
          </div>
        )}
      </div>
    </div>
  );
};
