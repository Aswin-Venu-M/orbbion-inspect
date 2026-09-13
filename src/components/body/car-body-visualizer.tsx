"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  BodyPartId, 
  BodyPartStatus, 
  BodyPartStatusValue,
  BODY_STATUS_COLORS,
  BODY_PART_LABELS,
  BODY_STATUS_LABELS,
  BODY_STATUS_LEGEND,
  INITIAL_BODY_PART_STATUSES
} from '@/constants/visualizers';
import { CAR_BODY_SVG_INNER } from './car-body-svg-data';
import { CheckCheck, RotateCcw, Info, ThumbsUp, ThumbsDown, Frown, Ban } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type { BodyPartId, BodyPartStatus, BodyPartStatusValue };

interface CarBodyVisualizerProps {
  statuses?: BodyPartStatus;
  onPartClick?: (partId: BodyPartId) => void;
  onPartStatusSelect?: (partId: BodyPartId, status: BodyPartStatusValue) => void;
  onBatchStatusChange?: (newStatuses: BodyPartStatus) => void;
}

// Precise hitbox polygons mapped directly to the SVG blueprint landmarks (269×182)
// Following wheel arches, door cutlines, rocker panels, windshield base, and bumper edges.
const HITBOX_PATHS: Record<BodyPartId, string> = {
  // ── Center top-down view ──────────────────────────────────────────────
  rearBumper:
    'M35.2792 124V58C35.2792 57.2 32.278 56.6667 30.7773 56.5C30.444 56.1667 29.2773 55.1 27.2773 53.5C24.7773 51.5 21.2773 51.5 17.2773 51.5C14.0773 51.5 4.61193 52.1667 0.279218 52.5V56.5C0.279218 59.5 0.279218 59.5 6.27734 62.5C12.2755 65.5 12.2773 70 12.2773 75.5V104C12.2773 118.5 7.77922 118.5 3.77922 120.5C0.579218 122.1 0.112551 122.833 0.279218 123V130.5H11.2792C14.9459 130.833 23.0792 131 26.2792 129C29.4792 127 33.6125 124.833 35.2792 124Z',

  // Trunk: matching public/assets/car-body/trunk.svg and Path 6 in car-body (3).svg (decklid crescent)
  trunk:
    'M61.2768 63.5 C61.6101 63 61.3768 62 57.7768 62 C54.1768 62 48.2768 62.6667 45.7768 63 C42.7768 66.3333 37.0768 77.1 38.2768 93.5 C39.7768 114 44.7773 119.5 48.7773 119.5 C51.9773 119.5 57.7773 119.833 60.2773 120 C60.6105 120 61.2768 119.7 61.2768 118.5 C59.5 116.5 58 108 58 91.5 C58 75 59.5 66 61.2768 63.5 Z',

  roof:
    'M86.7762 113.5C84.7762 103.9 85.9428 79.1667 86.7762 68L157.777 66.5C160.111 76.3333 163.377 99.8 157.777 115C151.377 114.2 107.777 113.667 86.7762 113.5Z',

  // Hood: matching public/assets/car-body/hood.svg and Path 4 in car-body (3).svg (bonnet contours from cowl to nose)
  hood:
    'M199.277 59.5 C200.977 57.3 205.777 56.5 211.777 55.5 C227.277 54 233.777 60 240.277 66 C243.277 79 242.777 92 242.777 92 C242.277 105 239.777 117.5 234.277 121.5 C228.777 125.5 219.777 126.5 210.277 126.5 C203.277 125.5 198.277 123.5 198.277 123.5 C202 110 205 97.2 205 91.5 C205 85 202 73 199.277 59.5 Z',

  frontBumper:
    'M268.278 126.5C265.878 118.1 267.278 75.6667 268.278 55.5C268.43 52.3 267.008 52.1667 266.277 52.5C261.111 52.1667 250.177 51.5 247.777 51.5C245.377 51.5 244.111 55.1667 243.777 57H241.277C243.777 58.5 246.777 77 246.777 91.5C246.777 103.1 243.111 119 241.277 125.5H243.777C243.777 127.1 245.777 129.5 246.777 130.5C251.111 130.333 260.777 130 264.777 130C268.777 130 268.778 127.667 268.278 126.5Z',

  // ── Bottom side view (Right side panels + door glasses) ──────────────
  // rightRearFender: rear bumper, quarter panel + fixed small quarter window
  rightRearFender:
    'M36.2767 133.5 V139.5 C35.9434 139.667 35.4767 140.5 36.2767 142.5 V149.5 L34.7764 150 V152.5 C34.1097 152.5 32.7764 152.9 32.7764 154.5 C32.7764 156.1 32.7764 161.167 32.7764 163.5 C32.2764 164.833 31.9764 167.6 34.7764 168 C37.5764 168.4 53.6104 169.833 61.2773 170.5 C60.944 166.333 62.0773 156.9 69.2773 152.5 C76.4773 148.1 84.6107 149.667 87.7773 151 C89.7773 152.333 94.1773 156.7 95.7773 163.5 V172 H96 L99.7773 162.5 C97.4444 158.167 91.7785 148.1 87.7785 142.5 C83.7785 136.9 84.1118 134.5 84.7785 134 L98.7773 133 L97.7773 122 C95.2771 121.5 84.7771 124.5 79.2771 128.5 C74.8771 131.7 77.4438 132.833 79.2771 133 C70.2767 122.5 54.7767 131.5 46.2767 132 C39.4767 132.4 36.7767 133.167 36.2767 133.5 Z',

  // rightBackDoor: Sheet metal door panel + Rear door window glass (up to B-pillar)
  rightBackDoor:
    'M97.7773 122 L98.7773 133 L84.7785 134 C84.1118 134.5 83.7785 136.9 87.7785 142.5 C91.7785 148.1 97.4444 158.167 99.7773 162.5 C101.111 164.667 105.477 169 112.277 169 C119.077 169 125 169 131.277 169 C131.277 166.667 131.377 160.1 131.777 152.5 C132.177 144.9 129.277 127.333 127.777 119.5 C124.277 119.5 108.777 119.5 101.277 121 Z',

  // rightFrontDoor: Sheet metal door panel + Front door window glass (B-pillar to A-pillar)
  rightFrontDoor:
    'M127.777 119.5 C129.277 127.333 132.177 144.9 131.777 152.5 C131.377 160.1 131.277 166.667 131.277 169 L175.777 170 C177.611 170.167 181.277 168 181.277 158 C181.277 145.5 181.777 141 180.277 139 L176.277 138 C166.277 127 149.777 119.5 130.777 119.5 Z',

  // rightFrontFender: Front fender + Front bumper side
  rightFrontFender:
    'M175.777 170 C177.611 170.167 181.277 168 181.277 158 C181.277 145.5 181.777 141 180.277 139 L176.277 138 C184.444 136.167 187.777 138 189.777 133 C203.377 141.4 213.11 144.5 216.277 145 C222.277 150.2 234.443 155.833 234.276 151.5 C237.776 152 240.277 152.5 242.777 153.5 C244.777 154.3 245.277 156.5 245.277 157.5 L244.777 170 L245.277 171 L225.277 172.5 C220.277 172.5 220.444 170 219.277 160.5 C217.777 156 209.277 146 196.277 151.5 C185.877 155.9 185.277 167 186.277 172 Z',

  // ── Top side view (Left side panels + door glasses - mirrored) ───────
  // leftRearFender: rear bumper, quarter panel + fixed small quarter window
  leftRearFender:
    'M36.1048 48.5 V42.5 C35.7715 42.3333 35.3048 41.5 36.1048 39.5 V32.5 L34.6045 32 V29.5 C33.9379 29.5 32.6045 29.1 32.6045 27.5 C32.6045 25.9 32.6045 20.8333 32.6045 18.5 C32.1045 17.1667 31.8045 14.4 34.6045 14 C37.4045 13.6 53.4385 12.1667 61.1055 11.5 C60.7721 15.6667 61.9055 25.1 69.1055 29.5 C76.3055 33.9 84.4388 32.3333 87.6055 31 C89.6055 29.6667 94.0055 25.3 95.6055 18.5 V10 H96 L99.6055 19.5 C97.2725 23.8333 91.6066 33.9 87.6066 39.5 C83.6066 45.1 83.94 47.5 84.6066 48 L98.6055 49 L97.6055 60 C95.1052 60.5 84.6052 57.5 79.1052 53.5 C74.7052 50.3 77.2719 49.1667 79.1052 49 C70.1048 59.5 54.6048 50.5 46.1048 50 C39.3048 49.6 36.6048 48.8333 36.1048 48.5 Z',

  // leftBackDoor: Sheet metal door panel + Rear door window glass (up to B-pillar)
  leftBackDoor:
    'M97.6055 60 L98.6055 49 L84.6066 48 C83.94 47.5 83.6066 45.1 87.6066 39.5 C91.6066 33.9 97.2725 23.8333 99.6055 19.5 C100.939 17.3333 105.305 13 112.105 13 C118.905 13 125 13 131.105 13 C131.105 15.3333 131.205 21.9 131.605 29.5 C132.005 37.1 129.105 54.6667 127.605 62.5 C124.105 62.5 108.605 62.5 101.105 61 Z',

  // leftFrontDoor: Sheet metal door panel + Front door window glass (B-pillar to A-pillar)
  leftFrontDoor:
    'M127.605 62.5 C129.105 54.6667 132.005 37.1 131.605 29.5 C131.205 21.9 131.105 15.3333 131.105 13 L175.605 12 C177.439 11.8333 181.105 14 181.105 24 C181.105 36.5 181.605 41 180.105 43 L176.105 44 C166.105 55 149.605 62.5 130.605 62.5 Z',

  // leftFrontFender: Front fender + Front bumper side
  leftFrontFender:
    'M175.605 12 C177.439 11.8333 181.105 14 181.105 24 C181.105 36.5 181.605 41 180.105 43 L176.105 44 C184.272 45.8333 187.605 44 189.605 49 C203.205 40.6 212.938 37.5 216.105 37 C222.105 31.8 234.272 26.1667 234.104 30.5 C237.604 30 240.105 29.5 242.605 28.5 C244.605 27.7 245.105 25.5 245.105 24.5 L244.605 12 L245.105 11 L225.105 9.5 C220.105 9.5 220.272 12 219.105 21.5 C217.605 26 209.105 36 196.105 30.5 C185.705 26.1 185.105 15 186.105 10 Z'
};

interface PartAnchor {
  left: string;
  top: string;
  transform: string;
}

// Precise anchor points for the 4-button action popup capsule across all 13 body panels
const PART_ANCHORS: Record<BodyPartId, PartAnchor> = {
  // Center top-down view (Hood, Trunk, Roof, Bumpers)
  rearBumper: { left: '16%', top: '48%', transform: 'translate(-10%, -125%)' },
  trunk: { left: '24%', top: '48%', transform: 'translate(-25%, -125%)' },
  roof: { left: '46%', top: '48%', transform: 'translate(-50%, -125%)' },
  hood: { left: '72%', top: '48%', transform: 'translate(-85%, -125%)' },
  frontBumper: { left: '80%', top: '48%', transform: 'translate(-92%, -125%)' },

  // Top side view (Left side of car: Y ~ 20%-30%) - popup placed below top car profile
  leftRearFender: { left: '26%', top: '28%', transform: 'translate(-15%, 20%)' },
  leftBackDoor: { left: '42%', top: '30%', transform: 'translate(-50%, 20%)' },
  leftFrontDoor: { left: '58%', top: '30%', transform: 'translate(-50%, 20%)' },
  leftFrontFender: { left: '72%', top: '28%', transform: 'translate(-85%, 20%)' },

  // Bottom side view (Right side of car: Y ~ 75%-85%) - popup placed above bottom car profile
  rightRearFender: { left: '26%', top: '74%', transform: 'translate(-15%, -125%)' },
  rightBackDoor: { left: '42%', top: '72%', transform: 'translate(-50%, -125%)' },
  rightFrontDoor: { left: '58%', top: '72%', transform: 'translate(-50%, -125%)' },
  rightFrontFender: { left: '72%', top: '74%', transform: 'translate(-85%, -125%)' },
};

interface BodyActionPopupProps {
  partId: BodyPartId;
  currentStatus: BodyPartStatusValue;
  onSelect: (status: BodyPartStatusValue) => void;
  onClose: () => void;
}

const BodyActionPopup: React.FC<BodyActionPopupProps> = ({
  partId,
  currentStatus,
  onSelect,
  onClose,
}) => {
  const anchor = PART_ANCHORS[partId] || { left: '50%', top: '50%', transform: 'translate(-50%, -125%)' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.92 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      onClick={(e) => e.stopPropagation()}
      className="absolute z-50 flex items-center gap-1 sm:gap-1.5 bg-[#4A4A4A] p-1.5 sm:p-2 rounded-[18px] sm:rounded-[22px] shadow-2xl pointer-events-auto select-none"
      style={{
        left: anchor.left,
        top: anchor.top,
        transform: anchor.transform,
      }}
    >
      {/* 1. Good / Original */}
      <button
        type="button"
        aria-label="Good / Original"
        title="Good / Original"
        onClick={(e) => {
          e.stopPropagation();
          onSelect('good');
          onClose();
        }}
        className={`w-[38px] h-[38px] sm:w-[46px] sm:h-[46px] bg-[#7FD159] rounded-[13px] sm:rounded-[16px] flex items-center justify-center text-[#2A5913] hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-sm ${
          currentStatus === 'good' ? 'ring-2 ring-white scale-105 shadow-md' : 'opacity-95'
        }`}
      >
        <ThumbsUp className="w-5 h-5 sm:w-5.5 sm:h-5.5" strokeWidth={2.5} />
      </button>

      {/* 2. Damaged */}
      <button
        type="button"
        aria-label="Damaged"
        title="Damaged"
        onClick={(e) => {
          e.stopPropagation();
          onSelect('damaged');
          onClose();
        }}
        className={`w-[38px] h-[38px] sm:w-[46px] sm:h-[46px] bg-[#FE8E4B] rounded-[13px] sm:rounded-[16px] flex items-center justify-center text-[#6E2A0C] hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-sm ${
          currentStatus === 'damaged' ? 'ring-2 ring-white scale-105 shadow-md' : 'opacity-95'
        }`}
      >
        <ThumbsDown className="w-5 h-5 sm:w-5.5 sm:h-5.5" strokeWidth={2.5} />
      </button>

      {/* 3. Repaired */}
      <button
        type="button"
        aria-label="Repaired"
        title="Repaired"
        onClick={(e) => {
          e.stopPropagation();
          onSelect('repaired');
          onClose();
        }}
        className={`w-[38px] h-[38px] sm:w-[46px] sm:h-[46px] bg-[#FFED00] rounded-[13px] sm:rounded-[16px] flex items-center justify-center text-[#7A7000] hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-sm ${
          currentStatus === 'repaired' ? 'ring-2 ring-white scale-105 shadow-md' : 'opacity-95'
        }`}
      >
        <Frown className="w-5 h-5 sm:w-5.5 sm:h-5.5" strokeWidth={2.5} />
      </button>

      {/* 4. Checked */}
      <button
        type="button"
        aria-label="Checked"
        title="Checked"
        onClick={(e) => {
          e.stopPropagation();
          onSelect('checked');
          onClose();
        }}
        className={`w-[38px] h-[38px] sm:w-[46px] sm:h-[46px] bg-[#D3D3D3] rounded-[13px] sm:rounded-[16px] flex items-center justify-center text-[#4A4A4A] hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-sm ${
          currentStatus === 'checked' ? 'ring-2 ring-white scale-105 shadow-md' : 'opacity-95'
        }`}
      >
        <Ban className="w-5 h-5 sm:w-5.5 sm:h-5.5" strokeWidth={2.5} />
      </button>
    </motion.div>
  );
};

const PART_IDS = Object.keys(HITBOX_PATHS) as BodyPartId[];

export const CarBodyVisualizer: React.FC<CarBodyVisualizerProps> = ({
  statuses = {},
  onPartClick,
  onPartStatusSelect,
  onBatchStatusChange
}) => {
  const [hoveredPart, setHoveredPart] = useState<BodyPartId | null>(null);
  const [activePopupPart, setActivePopupPart] = useState<BodyPartId | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Escape key listener
  useEffect(() => {
    if (!activePopupPart) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActivePopupPart(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePopupPart]);

  // Click outside listener
  useEffect(() => {
    if (!activePopupPart) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActivePopupPart(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activePopupPart]);

  const getPartStatus = (id: BodyPartId): BodyPartStatusValue => {
    return (statuses[id] || 'good') as BodyPartStatusValue;
  };

  const getPartFill = (id: BodyPartId) => {
    const status = getPartStatus(id);
    return BODY_STATUS_COLORS[status] || BODY_STATUS_COLORS.good;
  };

  const isHighlighted = (id: BodyPartId) => hoveredPart === id || activePopupPart === id;

  const handleSelectStatus = (partId: BodyPartId, newStatus: BodyPartStatusValue) => {
    if (onPartStatusSelect) {
      onPartStatusSelect(partId, newStatus);
    } else if (onBatchStatusChange) {
      onBatchStatusChange({ ...statuses, [partId]: newStatus });
    }
  };

  const handlePartHitboxClick = (id: BodyPartId) => {
    setActivePopupPart((prev) => (prev === id ? null : id));
    setHoveredPart(id);
    onPartClick?.(id);
  };

  // Compute live counts for each status
  const counts = React.useMemo(() => {
    const summary: Record<BodyPartStatusValue, number> = {
      good: 0,
      repaired: 0,
      damaged: 0,
      checked: 0,
    };
    PART_IDS.forEach(id => {
      const st = getPartStatus(id);
      summary[st] = (summary[st] || 0) + 1;
    });
    return summary;
  }, [statuses]);

  // Bulk actions
  const handleMarkAll = (targetStatus: BodyPartStatusValue) => {
    if (!onBatchStatusChange) return;
    const next: BodyPartStatus = {};
    PART_IDS.forEach(id => {
      next[id] = targetStatus;
    });
    onBatchStatusChange(next);
  };

  const activeDisplayPart = activePopupPart || hoveredPart;

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* ── Active Part Info Banner / Tooltip ── */}
      <div className="w-full max-w-[850px] min-h-[36px] flex items-center justify-between px-3 py-1.5 bg-[#F8F9FC] border border-[#E9EBEF] rounded-xl text-xs">
        <div className="flex items-center gap-2">
          <Info size={14} className="text-[#74768B] shrink-0" />
          {activeDisplayPart ? (
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#1E1035]">{BODY_PART_LABELS[activeDisplayPart]}</span>
              <span className="text-[#74768B]">•</span>
              <span 
                className="px-2 py-0.5 rounded-full text-[11px] font-semibold text-white"
                style={{ backgroundColor: BODY_STATUS_COLORS[getPartStatus(activeDisplayPart)] }}
              >
                {BODY_STATUS_LABELS[getPartStatus(activeDisplayPart)]?.label}
              </span>
              <span className="text-[11px] text-[#74768B] hidden sm:inline">
                ({BODY_STATUS_LABELS[getPartStatus(activeDisplayPart)]?.description})
              </span>
            </div>
          ) : (
            <span className="text-[#74768B]">
              Click any panel to select its inspection status (<span className="text-[#7FD159] font-semibold">Good</span>, <span className="text-[#FE8E4B] font-semibold">Damaged</span>, <span className="text-[#FFED00] font-semibold">Repaired</span>, or <span className="text-[#A0A4AB] font-semibold">Checked</span>).
            </span>
          )}
        </div>

        {activeDisplayPart && (
          <span className="text-[11px] font-medium text-[#1E1035]/60 shrink-0 hidden md:inline">
            {activePopupPart ? 'Select status from popup capsule' : 'Click panel to open status popup'}
          </span>
        )}
      </div>

      {/* ── Main Interactive Blueprint SVG ── */}
      <div 
        ref={containerRef}
        className="relative w-full max-w-[850px] bg-white rounded-2xl p-2 sm:p-4 border border-[#ECEEF2] shadow-sm overflow-visible group"
      >
        <svg
          viewBox="0 0 269 182"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto block select-none"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* ── Layer 1: Clickable hitbox zones (behind blueprint lines) ── */}
          {PART_IDS.map((id) => {
            const status = getPartStatus(id);
            const active = isHighlighted(id);
            const isOpen = activePopupPart === id;
            return (
              <path
                key={`hitbox-${id}`}
                id={`body-part-${id}`}
                role="button"
                tabIndex={0}
                aria-label={`${BODY_PART_LABELS[id]}: ${BODY_STATUS_LABELS[status]?.label || status}`}
                d={HITBOX_PATHS[id]}
                fill={getPartFill(id)}
                fillOpacity={isOpen ? 0.85 : active ? 0.72 : 0.48}
                stroke={isOpen ? '#1E1035' : active ? '#1E1035' : 'none'}
                strokeWidth={isOpen ? 1.4 : active ? 0.8 : 0}
                strokeLinejoin="round"
                className="cursor-pointer transition-all duration-150 outline-none focus:stroke-[#1E1035] focus:stroke-[1.2px]"
                style={{ 
                  filter: isOpen
                    ? 'brightness(1.25) drop-shadow(0 0 5px rgba(30,16,53,0.35))'
                    : active 
                    ? 'brightness(1.18) drop-shadow(0 0 3px rgba(30,16,53,0.25))' 
                    : 'none' 
                }}
                onMouseEnter={() => setHoveredPart(id)}
                onMouseLeave={() => setHoveredPart(null)}
                onFocus={() => setHoveredPart(id)}
                onBlur={() => setHoveredPart(null)}
                onClick={() => handlePartHitboxClick(id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handlePartHitboxClick(id);
                  }
                }}
              />
            );
          })}

          {/* ── Layer 2: Full blueprint SVG lines (on top, non-interactive) ── */}
          <g
            pointerEvents="none"
            dangerouslySetInnerHTML={{ __html: CAR_BODY_SVG_INNER }}
          />
        </svg>

        {/* ── Floating Action Popup Capsule (matches Tyres / Chassis section) ── */}
        <AnimatePresence>
          {activePopupPart && (
            <BodyActionPopup
              partId={activePopupPart}
              currentStatus={getPartStatus(activePopupPart)}
              onSelect={(status) => handleSelectStatus(activePopupPart, status)}
              onClose={() => setActivePopupPart(null)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* ── Interactive Legend & Quick Actions Bar ── */}
      <div className="w-full max-w-[850px] flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Status Legend Pills */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {BODY_STATUS_LEGEND.map((item) => (
            <div 
              key={item.state}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#E9EBEF] rounded-full text-xs font-medium text-[#1E1035] shadow-2xs"
            >
              <span 
                className="w-2.5 h-2.5 rounded-full shrink-0" 
                style={{ backgroundColor: item.color }} 
              />
              <span>{item.label}</span>
              <span className="ml-0.5 px-1.5 py-0.2 bg-[#F4F5F8] text-[#74768B] text-[10px] font-bold rounded-full">
                {counts[item.state]}
              </span>
            </div>
          ))}
        </div>

        {/* Quick Batch Actions */}
        {onBatchStatusChange && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleMarkAll('good')}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#74768B] hover:text-[#1E1035] hover:bg-[#F4F5F8] border border-transparent hover:border-[#E2E4EB] rounded-lg transition-all cursor-pointer"
              title="Reset all body panels to Good condition"
            >
              <RotateCcw size={12} />
              <span>Reset Good</span>
            </button>
            <button
              type="button"
              onClick={() => handleMarkAll('checked')}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/60 rounded-lg transition-all cursor-pointer"
              title="Mark all body panels as Checked"
            >
              <CheckCheck size={13} />
              <span>Mark All Checked</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
