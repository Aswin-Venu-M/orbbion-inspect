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
  activeBg: string;
  activeText: string;
}> = [
  { id: 'pass', label: 'PASS', activeBg: 'bg-[#71D64B]', activeText: 'text-white' },
  { id: 'fail', label: 'FAIL', activeBg: 'bg-[#FE8E4B]', activeText: 'text-white' },
  { id: 'weak', label: 'WEAK', activeBg: 'bg-[#FFED00]', activeText: 'text-[#7A7000]' },
  { id: 'na', label: 'N/A', activeBg: 'bg-[#D3D3D3]', activeText: 'text-[#4A4A4A]' },
];

export const VerificationStatusTabs: React.FC<VerificationStatusTabsProps> = ({
  value,
  onChange,
  includeNa = true,
  disabled = false,
  className = '',
  layoutId,
}) => {
  const generatedId = useId();
  const activeLayoutId = layoutId || `status-pill-${generatedId}`;

  const items = includeNa 
    ? STATUS_ITEMS 
    : STATUS_ITEMS.filter((item) => item.id !== 'na');

  return (
    <div
      role="group"
      aria-label="Verification status tabs"
      className={`flex items-center flex-nowrap bg-[#F4F5F8] p-[3px] rounded-full border border-[#E2E4EB] shrink-0 self-start sm:self-auto relative ${className}`}
    >
      {items.map((item) => {
        const isActive = value === item.id;
        return (
          <motion.button
            key={item.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(item.id)}
            whileTap={{ scale: disabled ? 1 : 0.94 }}
            whileHover={{ scale: disabled ? 1 : isActive ? 1 : 1.04 }}
            className={`px-3 sm:px-4 py-1 rounded-full text-[11px] tracking-wide font-bold whitespace-nowrap cursor-pointer relative select-none flex items-center justify-center z-0 transition-all ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isActive && (
              <motion.div
                layoutId={activeLayoutId}
                className={`absolute inset-0 rounded-full shadow-sm ${item.activeBg}`}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 35,
                }}
              />
            )}
            <span
              className={`relative z-10 transition-colors duration-150 ${
                isActive ? `${item.activeText} font-extrabold` : 'text-[#74768B] hover:text-[#1E1035]'
              }`}
            >
              {item.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};
