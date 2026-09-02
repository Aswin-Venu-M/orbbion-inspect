import React, { useId } from 'react';

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
          value={value}
          onChange={onChange}
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
