import React from 'react';
import { ChevronDown } from 'lucide-react';

export const SelectField = ({ label, required, placeholder, icon }: {
  label: string;
  required?: boolean;
  placeholder?: string;
  icon?: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-[#1E1035]">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    <div className="relative flex items-center">
      {icon && (
        <div className="absolute left-3.5 text-slate-400">
          {icon}
        </div>
      )}
      <select
        className={`w-full h-[46px] bg-[#F4F5F8] border border-[#E2E4EB] text-sm text-slate-400 rounded-[14px] px-4 appearance-none focus:outline-none focus:ring-2 focus:ring-[#1E1035]/20 transition-all ${
          icon ? "pl-11" : ""
        }`}
        defaultValue=""
      >
        <option value="" disabled>{placeholder}</option>
      </select>
      <div className="absolute right-3.5 text-[#190933] pointer-events-none">
        <ChevronDown size={16} strokeWidth={2.5} />
      </div>
    </div>
  </div>
);
