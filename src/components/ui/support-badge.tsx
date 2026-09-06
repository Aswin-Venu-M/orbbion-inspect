/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SupportBadgeProps {
  className?: string;
}

export const SupportBadge: React.FC<SupportBadgeProps> = ({ className = '' }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);

  const isVisible = isHovered || isOpen;

  // Close on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (badgeRef.current && !badgeRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div
      ref={badgeRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsOpen((prev) => !prev)}
      role="button"
      tabIndex={0}
      aria-label="Orbbion Support"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsOpen((prev) => !prev);
        }
      }}
      className={`fixed bottom-[84px] md:bottom-6 right-3 sm:right-4 md:right-6 z-40 flex items-center transition-all duration-300 cursor-pointer select-none origin-bottom-right print:hidden ${
        isVisible
          ? 'bg-white/95 backdrop-blur-md border border-slate-200/80 px-3 sm:px-3.5 py-2 sm:py-2 rounded-2xl shadow-xl'
          : 'bg-[#180321] p-2 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
      } ${className}`}
    >
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, width: 0, marginRight: 0 }}
            animate={{ opacity: 1, width: 'auto', marginRight: 10 }}
            exit={{ opacity: 0, width: 0, marginRight: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="overflow-hidden whitespace-nowrap flex flex-col items-end text-right"
          >
            <span className="text-[12px] font-bold text-[#1E1035] leading-tight tracking-tight">
              Support@orbbion.com
            </span>
            <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase leading-tight mt-0.5">
              v.2.0 • Orbbion Inspect
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={`flex items-center justify-center shrink-0 transition-transform duration-200 ${
          isVisible
            ? 'w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#180321] p-1 shadow-xs'
            : 'w-7 h-7 sm:w-8 sm:h-8'
        }`}
      >
        <img
          src="/assets/orbbion-logo.png"
          alt="Orbbion Inspect"
          className="w-full h-full object-contain pointer-events-none"
        />
      </div>
    </div>
  );
};
