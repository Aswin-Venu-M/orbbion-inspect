"use client";

import React, { useState } from 'react';
import { 
  BodyPartId, 
  BodyPartStatus, 
  BODY_STATUS_COLORS, 
  BODY_PART_SVG_PATHS 
} from '@/constants/visualizers';

export type { BodyPartId, BodyPartStatus };

interface CarBodyVisualizerProps {
  statuses?: BodyPartStatus;
  onPartClick?: (partId: BodyPartId) => void;
}

// Per-part placement config for the car-body.svg (viewBox: 0 0 269 182)
// Each part's path data lives in its own local coordinate space (from the component SVGs).
// We translate to the target position, then scale from local coords to final size.
interface PartConfig {
  id: BodyPartId;
  /** Target top-left X in the 269×182 SVG space */
  x: number;
  /** Target top-left Y in the 269×182 SVG space */
  y: number;
  /** Scale factor X = targetWidth / partLocalWidth */
  sx: number;
  /** Scale factor Y = targetHeight / partLocalHeight */
  sy: number;
}

// Part placements measured against the new car-body.svg landmarks:
// Bottom car (right side): wheels at y≈167, body y≈118..178
// Top car (left side, mirrored): wheels at y≈15, body y≈4..63
// Center (top-down): y≈52..130
const PART_PLACEMENTS: PartConfig[] = [
  // BOTTOM CAR — Right side panels
  // Part local sizes: rightRearFender=208×137, rightBackDoor=126×94, rightFrontDoor=136×88, rightFrontFender=177×104
  { id: 'rightRearFender',  x: 25,  y: 118, sx: 72/208,  sy: 61/137  },
  { id: 'rightBackDoor',    x: 83,  y: 133, sx: 44/126,  sy: 45/94   },
  { id: 'rightFrontDoor',   x: 125, y: 133, sx: 48/136,  sy: 45/88   },
  { id: 'rightFrontFender', x: 165, y: 118, sx: 73/177,  sy: 61/104  },

  // TOP CAR — Left side panels (mirrored)
  { id: 'leftRearFender',   x: 25,  y: 2,   sx: 72/208,  sy: 61/137  },
  { id: 'leftBackDoor',     x: 83,  y: 4,   sx: 44/126,  sy: 45/94   },
  { id: 'leftFrontDoor',    x: 125, y: 4,   sx: 48/136,  sy: 45/88   },
  { id: 'leftFrontFender',  x: 165, y: 2,   sx: 73/177,  sy: 61/104  },

  // CENTER — Top-down view panels
  // Part local sizes: rearBumper=93×210, trunk=51×153, roof=201×127, hood=116×187, frontBumper=65×209
  { id: 'rearBumper',       x: 4,   y: 52,  sx: 32/93,   sy: 78/210  },
  { id: 'trunk',            x: 41,  y: 56,  sx: 18/51,   sy: 70/153  },
  { id: 'roof',             x: 82,  y: 58,  sx: 70/201,  sy: 65/127  },
  { id: 'hood',             x: 189, y: 50,  sx: 40/116,  sy: 82/187  },
  { id: 'frontBumper',      x: 233, y: 52,  sx: 23/65,   sy: 78/209  },
];

export const CarBodyVisualizer: React.FC<CarBodyVisualizerProps> = ({
  statuses = {},
  onPartClick
}) => {
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  const getPartFill = (id: string) => {
    const status = (statuses[id] || 'good') as keyof typeof BODY_STATUS_COLORS;
    return BODY_STATUS_COLORS[status] || BODY_STATUS_COLORS.good;
  };

  const isHighlighted = (id: string) => hoveredPart === id;

  const paths = BODY_PART_SVG_PATHS;

  // Render a clickable part with per-part transform
  const renderPart = (config: PartConfig) => {
    const { id, x, y, sx, sy } = config;
    const pathData = paths[id];
    if (!pathData) return null;
    
    return (
      <g 
        key={id}
        transform={`translate(${x}, ${y}) scale(${sx}, ${sy})`}
        className="cursor-pointer transition-all"
        style={{ filter: isHighlighted(id) ? 'brightness(1.15)' : 'none' }}
        onMouseEnter={() => setHoveredPart(id)}
        onMouseLeave={() => setHoveredPart(null)}
        onClick={() => onPartClick?.(id)}
      >
        <path 
          d={pathData} 
          fill={getPartFill(id)} 
          fillOpacity={isHighlighted(id) ? 0.8 : 0.55} 
          stroke="#1E1035" 
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </g>
    );
  };

  return (
    <div className="w-full relative flex items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-[850px]">
        {/* Base Car Blueprint SVG */}
        <img 
          src="/assets/car-body.svg" 
          alt="Car Body Blueprint" 
          className="w-full h-auto block select-none pointer-events-none"
        />

        {/* SVG Interactive Overlay — viewBox matches car-body.svg exactly (269×182) */}
        <svg 
          viewBox="0 0 269 182"
          preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 w-full h-full select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {PART_PLACEMENTS.map(renderPart)}
        </svg>
      </div>
    </div>
  );
};
