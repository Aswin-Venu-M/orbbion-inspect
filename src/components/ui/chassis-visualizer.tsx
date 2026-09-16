/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useRef } from 'react';
import { ThumbsUp, ThumbsDown, Frown, Ban } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { InspectionDetailCard, InspectionDetailState } from './inspection-detail-card';
import { 
  CHASSIS_STATUS_COLORS, 
  CHASSIS_WHEEL_POSITIONS, 
  CHASSIS_STATUS_LEGEND 
} from '@/constants/visualizers';

export type InspectionState = 'pass' | 'fail' | 'weak' | 'na';

const getColor = (state: InspectionState) => {
  return CHASSIS_STATUS_COLORS[state] || CHASSIS_STATUS_COLORS.na;
};

const ActionPopup = ({ onSelect, onClose, popupRef }: { onSelect: (s: InspectionState) => void, onClose: () => void, popupRef?: React.RefObject<HTMLDivElement | null> | null }) => {
  // Add escape key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <motion.div 
      ref={popupRef}
      initial={{ opacity: 0, y: 10, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.9 }}
      className="absolute z-50 flex gap-1 sm:gap-1.5 bg-[#4A4A4A] p-1.5 sm:p-2 rounded-[20px] sm:rounded-[24px] shadow-2xl -top-[70px] sm:-top-[80px] left-1/2 -translate-x-1/2 max-w-[92vw]"
    >
      <button aria-label="Pass" onClick={(e) => { e.stopPropagation(); onSelect('pass'); onClose(); }} className="w-[42px] h-[42px] sm:w-[52px] sm:h-[52px] bg-[#7FD159] rounded-[14px] sm:rounded-[18px] flex items-center justify-center text-[#2A5913] hover:brightness-110 transition-all shadow-sm"><ThumbsUp className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} /></button>
      <button aria-label="Fail" onClick={(e) => { e.stopPropagation(); onSelect('fail'); onClose(); }} className="w-[42px] h-[42px] sm:w-[52px] sm:h-[52px] bg-[#FE8E4B] rounded-[14px] sm:rounded-[18px] flex items-center justify-center text-[#6E2A0C] hover:brightness-110 transition-all shadow-sm"><ThumbsDown className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} /></button>
      <button aria-label="Weak" onClick={(e) => { e.stopPropagation(); onSelect('weak'); onClose(); }} className="w-[42px] h-[42px] sm:w-[52px] sm:h-[52px] bg-[#FFED00] rounded-[14px] sm:rounded-[18px] flex items-center justify-center text-[#7A7000] hover:brightness-110 transition-all shadow-sm"><Frown className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} /></button>
      <button aria-label="Not Available" onClick={(e) => { e.stopPropagation(); onSelect('na'); onClose(); }} className="w-[42px] h-[42px] sm:w-[52px] sm:h-[52px] bg-[#D3D3D3] rounded-[14px] sm:rounded-[18px] flex items-center justify-center text-[#4A4A4A] hover:brightness-110 transition-all shadow-sm"><Ban className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} /></button>
    </motion.div>
  );
};

const VisualizerButton = ({ id, label, top, left, state, activePopup, setActivePopup, setItemState }: { id: string, label: string, top: string, left: string, state: InspectionState, activePopup: string | null, setActivePopup: (s: string | null) => void, setItemState: (id: string, s: InspectionState) => void }) => {
  const isActive = activePopup === id;
  const color = getColor(state);
  const containerRef = useRef<HTMLDivElement>(null);

  // Click outside listener
  useEffect(() => {
    if (!isActive) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActivePopup(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isActive, setActivePopup]);

  return (
    <div 
      className="absolute flex items-center justify-center"
      style={{ top, left, transform: 'translate(-50%, -50%)' }}
    >
      <div className="relative" ref={containerRef}>
        <button 
          aria-expanded={isActive}
          onClick={() => setActivePopup(isActive ? null : id)}
          className="w-14 h-14 rounded-full flex items-center justify-center text-[#190933] font-bold text-sm shadow-md transition-all hover:scale-105 border-2 border-white/40 backdrop-blur-sm"
          style={{ backgroundColor: color }}
        >
          {label}
        </button>
        <AnimatePresence>
          {isActive && (
            <ActionPopup popupRef={null} onSelect={(s) => setItemState(id, s)} onClose={() => setActivePopup(null)} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export const ChassisVisualizer = ({ 
  items, 
  setItemStatus, 
  hideLegend = false, 
  compact = false 
}: { 
  items: Record<string, InspectionDetailState>; 
  setItemStatus: (id: string, s: InspectionState) => void;
  hideLegend?: boolean;
  compact?: boolean;
}) => {
  const [activePopup, setActivePopup] = useState<string | null>(null);

  return (
    <div className={`w-full flex flex-col ${compact ? 'py-0' : 'pt-2 pb-6'}`}>
      {/* Legend */}
      {!hideLegend && (
        <div className="flex flex-wrap items-center gap-4 px-2 mb-6">
          {CHASSIS_STATUS_LEGEND.map((leg) => (
            <div key={leg.label} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-md" style={{ backgroundColor: leg.color }} />
              <span className="text-xs font-semibold text-slate-500">{leg.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Chassis View */}
      <div className={`relative w-full ${compact ? 'max-w-[500px]' : 'max-w-[700px]'} mx-auto aspect-[4/3] flex items-center justify-center`}>
        {/* Texts */}
        <div className="absolute top-[20%] right-[15%] text-[#A0A4AB] font-bold text-xl tracking-wide">Front</div>
        <div className="absolute bottom-[10%] left-[15%] text-[#A0A4AB] font-bold text-xl tracking-wide">Back</div>

        <img src="/assets/chasis.png" alt="Vehicle Chassis" className="w-[80%] h-auto object-contain opacity-80 pointer-events-none" />

        {/* Isometric 5-wheel buttons */}
        {CHASSIS_WHEEL_POSITIONS.map((wheel) => (
          <VisualizerButton 
            key={wheel.id}
            id={wheel.id} 
            label={wheel.label} 
            top={wheel.top} 
            left={wheel.left} 
            state={items?.[wheel.id]?.status || 'na'} 
            activePopup={activePopup} 
            setActivePopup={setActivePopup} 
            setItemState={setItemStatus} 
          />
        ))}
      </div>
    </div>
  );
};
