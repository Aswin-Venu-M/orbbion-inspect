"use client";

import React, { useState } from 'react';
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
import { CheckCheck, RotateCcw, Info } from 'lucide-react';

export type { BodyPartId, BodyPartStatus, BodyPartStatusValue };

interface CarBodyVisualizerProps {
  statuses?: BodyPartStatus;
  onPartClick?: (partId: BodyPartId) => void;
  onBatchStatusChange?: (newStatuses: BodyPartStatus) => void;
}

// Precise hitbox polygons mapped directly to the SVG blueprint landmarks (269×182)
// Following wheel arches, door cutlines, rocker panels, windshield base, and bumper edges.
const HITBOX_PATHS: Record<BodyPartId, string> = {
  // ── Center top-down view ──────────────────────────────────────────────
  rearBumper:
    'M35.2792 124V58C35.2792 57.2 32.278 56.6667 30.7773 56.5C30.444 56.1667 29.2773 55.1 27.2773 53.5C24.7773 51.5 21.2773 51.5 17.2773 51.5C14.0773 51.5 4.61193 52.1667 0.279218 52.5V56.5C0.279218 59.5 0.279218 59.5 6.27734 62.5C12.2755 65.5 12.2773 70 12.2773 75.5V104C12.2773 118.5 7.77922 118.5 3.77922 120.5C0.579218 122.1 0.112551 122.833 0.279218 123V130.5H11.2792C14.9459 130.833 23.0792 131 26.2792 129C29.4792 127 33.6125 124.833 35.2792 124Z',

  trunk:
    'M35.2792 58 C45 61 65 64 86.7762 68 C85.9428 79.1667 84.7762 103.9 86.7762 113.5 C65 117.5 45 121 35.2792 124 Z',

  roof:
    'M86.7762 113.5C84.7762 103.9 85.9428 79.1667 86.7762 68L157.777 66.5C160.111 76.3333 163.377 99.8 157.777 115C151.377 114.2 107.777 113.667 86.7762 113.5Z',

  hood:
    'M157.777 66.5 C185 62 212 57.5 241.277 57 C243.777 58.5 246.777 77 246.777 91.5 C246.777 103.1 243.111 119 241.277 125.5 C212 125 185 120.5 157.777 115 C163.377 99.8 160.111 76.3333 157.777 66.5 Z',

  frontBumper:
    'M268.278 126.5C265.878 118.1 267.278 75.6667 268.278 55.5C268.43 52.3 267.008 52.1667 266.277 52.5C261.111 52.1667 250.177 51.5 247.777 51.5C245.377 51.5 244.111 55.1667 243.777 57H241.277C243.777 58.5 246.777 77 246.777 91.5C246.777 103.1 243.111 119 241.277 125.5H243.777C243.777 127.1 245.777 129.5 246.777 130.5C251.111 130.333 260.777 130 264.777 130C268.777 130 268.778 127.667 268.278 126.5Z',

  // ── Bottom side view (Right side panels) ──────────────────────────────
  rightRearFender:
    'M36.2767 133.5 V139.5 C35.9434 139.667 35.4767 140.5 36.2767 142.5 V149.5 L34.7764 150 V152.5 C34.1097 152.5 32.7764 152.9 32.7764 154.5 C32.7764 156.1 32.7764 161.167 32.7764 163.5 C32.2764 164.833 31.9764 167.6 34.7764 168 C37.5764 168.4 53.6104 169.833 61.2773 170.5 C60.944 166.333 62.0773 156.9 69.2773 152.5 C76.4773 148.1 84.6107 149.667 87.7773 151 C89.7773 152.333 94.1773 156.7 95.7773 163.5 V172 H98.5 L98.5 120 C87 122 70.2767 122.5 54.7767 131.5 C46.2767 132 39.4767 132.4 36.2767 133.5 Z',

  rightBackDoor:
    'M98.5 172 H131.3 L131.3 115.5 C120 115 107 114.5 98.5 120 Z',

  rightFrontDoor:
    'M131.3 172 H171 L171 135 C164 125 153.8 117 144.3 116 C139 115.5 134 115.5 131.3 115.5 Z',

  rightFrontFender:
    'M171 172 H186.277 C185.277 167 185.877 155.9 196.277 151.5 C209.277 146 217.777 156 219.277 160.5 C220.477 164.1 220.444 170 220.277 172.5 H225.277 L244.777 170 L245.277 157.5 C245.277 156.5 244.777 154.3 242.777 153.5 C240.277 152.5 237.776 152 234.276 151.5 C234.443 155.833 222.277 150.2 216.277 145 C213.11 144.5 203.377 141.4 189.777 133 C178 126 172.5 132 171 135 Z',

  // ── Top side view (Left side panels - mirrored) ───────────────────────
  leftRearFender:
    'M36.1048 48.5 V42.5 C35.7715 42.3333 35.3048 41.5 36.1048 39.5 V32.5 L34.6045 32 V29.5 C33.9379 29.5 32.6045 29.1 32.6045 27.5 C32.6045 25.9 32.6045 20.8333 32.6045 18.5 C32.1045 17.1667 31.8045 14.4 34.6045 14 C37.4045 13.6 53.4385 12.1667 61.1055 11.5 C60.7721 15.6667 61.9055 25.1 69.1055 29.5 C76.3055 33.9 84.4388 32.3333 87.6055 31 C89.6055 29.6667 94.0055 25.3 95.6055 18.5 V10 H98.5 L98.5 62 C87 60 70.1048 59.5 54.6048 50.5 C46.1048 50 39.3048 49.6 36.1048 48.5 Z',

  leftBackDoor:
    'M98.5 10 H131.1 L131.1 66.5 C120 67 107 67.5 98.5 62 Z',

  leftFrontDoor:
    'M131.1 10 H171 L171 47 C164 57 153.6 65 144.1 66 C139 66.5 134 66.5 131.1 66.5 Z',

  leftFrontFender:
    'M171 10 H186.105 C185.105 15.0001 185.705 26.1001 196.105 30.5001 C209.105 36 217.605 26.0001 219.105 21.5001 C220.305 17.9001 220.272 12.0001 220.105 9.50005 H225.105 L244.605 12.0001 L245.105 24.5001 C245.105 25.5001 244.605 27.7001 242.605 28.5001 C240.105 29.5 237.604 30.0001 234.104 30.5001 C234.271 26.1667 222.105 31.8001 216.105 37.0001 C212.938 37.5001 203.205 40.6001 189.605 49.0001 C178 56 172.5 50 171 47 Z'
};


const PART_IDS = Object.keys(HITBOX_PATHS) as BodyPartId[];

export const CarBodyVisualizer: React.FC<CarBodyVisualizerProps> = ({
  statuses = {},
  onPartClick,
  onBatchStatusChange
}) => {
  const [hoveredPart, setHoveredPart] = useState<BodyPartId | null>(null);

  const getPartStatus = (id: BodyPartId): BodyPartStatusValue => {
    return (statuses[id] || 'good') as BodyPartStatusValue;
  };

  const getPartFill = (id: BodyPartId) => {
    const status = getPartStatus(id);
    return BODY_STATUS_COLORS[status] || BODY_STATUS_COLORS.good;
  };

  const isHighlighted = (id: BodyPartId) => hoveredPart === id;

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

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* ── Active Part Info Banner / Tooltip ── */}
      <div className="w-full max-w-[850px] min-h-[36px] flex items-center justify-between px-3 py-1.5 bg-[#F8F9FC] border border-[#E9EBEF] rounded-xl text-xs">
        <div className="flex items-center gap-2">
          <Info size={14} className="text-[#74768B] shrink-0" />
          {hoveredPart ? (
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#1E1035]">{BODY_PART_LABELS[hoveredPart]}</span>
              <span className="text-[#74768B]">•</span>
              <span 
                className="px-2 py-0.5 rounded-full text-[11px] font-semibold text-white"
                style={{ backgroundColor: BODY_STATUS_COLORS[getPartStatus(hoveredPart)] }}
              >
                {BODY_STATUS_LABELS[getPartStatus(hoveredPart)]?.label}
              </span>
              <span className="text-[11px] text-[#74768B] hidden sm:inline">
                ({BODY_STATUS_LABELS[getPartStatus(hoveredPart)]?.description})
              </span>
            </div>
          ) : (
            <span className="text-[#74768B]">
              Hover or tap any panel to inspect. Click to cycle status (<span className="text-[#50E3C2] font-semibold">Good</span> → <span className="text-[#4A90E2] font-semibold">Repaired</span> → <span className="text-[#FF5A5F] font-semibold">Damaged</span> → <span className="text-[#71D64B] font-semibold">Checked</span>).
            </span>
          )}
        </div>

        {hoveredPart && (
          <span className="text-[11px] font-medium text-[#1E1035]/60 shrink-0 hidden md:inline">
            Click to cycle status
          </span>
        )}
      </div>

      {/* ── Main Interactive Blueprint SVG ── */}
      <div className="relative w-full max-w-[850px] bg-white rounded-2xl p-2 sm:p-4 border border-[#ECEEF2] shadow-sm overflow-hidden group">
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
            return (
              <path
                key={`hitbox-${id}`}
                id={`body-part-${id}`}
                role="button"
                tabIndex={0}
                aria-label={`${BODY_PART_LABELS[id]}: ${BODY_STATUS_LABELS[status]?.label || status}`}
                d={HITBOX_PATHS[id]}
                fill={getPartFill(id)}
                fillOpacity={active ? 0.75 : 0.48}
                stroke={active ? '#1E1035' : 'none'}
                strokeWidth={active ? 0.8 : 0}
                strokeLinejoin="round"
                className="cursor-pointer transition-all duration-150 outline-none focus:stroke-[#1E1035] focus:stroke-[1px]"
                style={{ 
                  filter: active ? 'brightness(1.18) drop-shadow(0 0 3px rgba(30,16,53,0.25))' : 'none' 
                }}
                onMouseEnter={() => setHoveredPart(id)}
                onMouseLeave={() => setHoveredPart(null)}
                onFocus={() => setHoveredPart(id)}
                onBlur={() => setHoveredPart(null)}
                onClick={() => onPartClick?.(id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onPartClick?.(id);
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
