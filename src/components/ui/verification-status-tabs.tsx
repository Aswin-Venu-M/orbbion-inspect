"use client";

import React, { useId } from 'react';
import { motion } from 'motion/react';

export type VerificationStatus = 'pass' | 'fail' | 'weak' | 'na';

export interface VerificationStatusTabsProps {
  value: VerificationStatus | null | undefined;
  onChange: (status: VerificationStatus) => void;
  includeNa?: boolean;
  disabled?: boolean;
  className?: string;
  layoutId?: string;
}

const STATUS_ITEMS: Array<{
  id: VerificationStatus;
  label: string;
  activeColor: string;
  activeText: string;
}> = [
  { id: 'pass', label: 'PASS', activeColor: '#71D64B', activeText: 'text-white' },
  { id: 'fail', label: 'FAIL', activeColor: '#FE8E4B', activeText: 'text-white' },
  { id: 'weak', label: 'WEAK', activeColor: '#FFED00', activeText: 'text-[#7A7000]' },
  { id: 'na', label: 'N/A', activeColor: '#D3D3D3', activeText: 'text-[#4A4A4A]' },
];

export const VerificationStatusTabs: React.FC<VerificationStatusTabsProps> = ({
  value,
  onChange,
  includeNa = true,
  disabled = false,
  className = '',
  layoutId,
}) => {
  const rawId = useId();
  const cleanId = rawId.replace(/[^a-zA-Z0-9]/g, '');
  const activeLayoutId = layoutId || `status-indicator-${cleanId}`;

  const items = includeNa 
    ? STATUS_ITEMS 
    : STATUS_ITEMS.filter((item) => item.id !== 'na');

  return (
    <div
      role="group"
      aria-label="Verification status tabs"
      className={`inline-flex items-center flex-nowrap bg-[#F4F5F8] p-[3px] rounded-full border border-[#E2E4EB] shrink-0 self-start sm:self-auto relative select-none ${className}`}
    >
      {items.map((item) => {
        const isActive = value === item.id;
        return (
          <button
            key={item.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(item.id)}
            className={`min-w-[46px] sm:min-w-[50px] px-3 sm:px-3.5 py-1 rounded-full text-[11px] tracking-wide font-bold whitespace-nowrap cursor-pointer relative flex items-center justify-center z-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9723FF]/40 ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isActive && (
              <motion.div
                layoutId={activeLayoutId}
                initial={false}
                className="absolute inset-0 rounded-full shadow-xs"
                style={{ backgroundColor: item.activeColor }}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 35,
                  mass: 0.8,
                }}
              />
            )}
            <motion.span
              whileTap={{ scale: disabled ? 1 : 0.92 }}
              animate={{ scale: isActive ? 1 : 0.98 }}
              transition={{ duration: 0.15 }}
              className={`relative z-10 transition-colors duration-150 inline-block font-bold ${
                isActive ? item.activeText : 'text-[#74768B] hover:text-[#1E1035]'
              }`}
            >
              {item.label}
            </motion.span>
          </button>
        );
      })}
    </div>
  );
};
