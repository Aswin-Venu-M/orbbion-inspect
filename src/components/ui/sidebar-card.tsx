"use client";

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SidebarCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  isAccordion?: boolean;
  defaultOpen?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
  id?: string;
}

export const SidebarCard: React.FC<SidebarCardProps> = ({
  title,
  description,
  children,
  isAccordion = false,
  defaultOpen = true,
  isOpen: controlledIsOpen,
  onToggle,
  icon,
  badge,
  className = '',
  id,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalIsOpen((prev) => !prev);
    }
  };

  if (!isAccordion) {
    return (
      <div id={id} className={`bg-white rounded-[28px] shadow-sm p-5 border border-slate-100 flex flex-col shrink-0 ${className}`}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 min-w-0">
            {icon && <span className="text-[#9723FF] shrink-0">{icon}</span>}
            <h3 className="text-[15px] font-bold text-[#1E1035] tracking-tight truncate">{title}</h3>
          </div>
          {badge}
        </div>
        {description && (
          <p className="text-slate-400 text-[10px] mb-4 leading-relaxed">{description}</p>
        )}
        <div className="space-y-4">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div 
      id={id} 
      className={`bg-white rounded-[28px] shadow-sm border border-slate-100/90 flex flex-col shrink-0 transition-all duration-300 overflow-hidden ${className}`}
    >
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={isOpen}
        className="w-full p-4 sm:p-5 text-left flex items-center justify-between group cursor-pointer select-none transition-colors hover:bg-slate-50/70"
      >
        <div className="flex items-start gap-2.5 min-w-0 pr-2">
          {icon && (
            <div className="w-8 h-8 rounded-xl bg-[#9723FF]/10 text-[#9723FF] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 group-hover:bg-[#9723FF]/15 transition-all">
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-[15px] font-bold text-[#1E1035] tracking-tight group-hover:text-[#9723FF] transition-colors">
                {title}
              </h3>
              {badge}
            </div>
            {description && (
              <p className="text-slate-400 text-[10px] sm:text-[11px] mt-0.5 leading-snug">
                {description}
              </p>
            )}
          </div>
        </div>
        
        <div 
          className={`w-7 h-7 rounded-xl flex items-center justify-center bg-slate-100/80 text-slate-500 group-hover:bg-[#9723FF]/15 group-hover:text-[#9723FF] transition-all duration-300 shrink-0 ${
            isOpen ? 'rotate-180 bg-[#9723FF]/10 text-[#9723FF]' : ''
          }`}
        >
          <ChevronDown size={15} strokeWidth={2.5} />
        </div>
      </button>

      {/* Accordion Body with CSS Grid transition */}
      <div 
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-5 sm:px-5 sm:pb-5 pt-1 space-y-4 border-t border-slate-100/70">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
