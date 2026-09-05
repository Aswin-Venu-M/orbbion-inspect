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

// Each body part SVG positioned precisely over the car-body.png blueprint.
// Image natural size: 777 x 514. viewBox matches 1:1 with image pixels.
// Positions measured from the car-body.png blueprint.
interface PartPlacement {
  id: BodyPartId;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  flipY?: boolean; // For top side view (wheels up) — mirrors vertically
}

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

  // ===========================================
  // BOTTOM SIDE VIEW (Wheels DOWN) — "right" side panels
  // Car faces RIGHT. Rear is at X~110, Front is at X~680
  // The car body occupies approximately Y: 330..500
  // ===========================================
  //
  // Measured from car-body.png (777×514):
  // - Right rear fender: starts around x=108, y=330, spans ~208px wide, ~137px tall
  // - Right back door:   starts around x=282, y=357, spans ~126px wide, ~94px tall
  // - Right front door:  starts around x=385, y=356, spans ~136px wide, ~88px tall
  // - Right front fender: starts around x=500, y=340, spans ~177px wide, ~104px tall
  //
  // TOP SIDE VIEW (Wheels UP) — "left" side panels
  // Same horizontal positions, but flipped vertically
  // The car body occupies approximately Y: 5..180
  // - Left rear fender: x=108, y flipped within ~5..180 region
  // - Left back door:   x=282, y flipped
  // - Left front door:  x=385, y flipped  
  // - Left front fender: x=500, y flipped
  //
  // CENTER TOP VIEW:
  // - Rear bumper (left edge):  x=28, y=142, width=93, height=210
  // - Trunk:                     x=135, y=170 (rotated)
  // - Roof:                      x=255, y=172, width=201, height=127 (scaled)
  // - Hood:                      x=510, y=158 (rotated)
  // - Front bumper (right edge): x=690, y=142, width=65, height=209

  // Precise path data from SVG constants
  const paths = BODY_PART_SVG_PATHS;

  // Helper to render a clickable part
  const renderPart = (
    id: BodyPartId, 
    pathData: string, 
    transform: string
  ) => (
    <g 
      key={id}
      transform={transform}
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
      />
    </g>
  );

  return (
    <div className="w-full relative flex items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-[850px]">
        {/* Base Car Blueprint Lineart Image */}
        <img 
          src="/assets/car-body.png" 
          alt="Car Body Blueprint" 
          className="w-full h-auto block select-none pointer-events-none"
        />

        {/* SVG Interactive Overlay — viewBox matches image natural size 777×514 */}
        <svg 
          viewBox="0 0 777 514"
          preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 w-full h-full select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Right Rear Fender */}
          {renderPart('rightRearFender', paths.rightRearFender, 'translate(121, 453)')}

          {/* Right Back Door */}
          {renderPart('rightBackDoor', paths.rightBackDoor, 'translate(257, 489)')}

          {/* Right Front Door */}
          {renderPart('rightFrontDoor', paths.rightFrontDoor, 'translate(382, 497)')}

          {/* Right Front Fender */}
          {renderPart('rightFrontFender', paths.rightFrontFender, 'translate(496, 489)')}


          {/* Left Rear Fender */}
          {renderPart('leftRearFender', paths.leftRearFender, 'translate(104.25, 106)')}

          {/* Left Back Door */}
          {renderPart('leftBackDoor', paths.leftBackDoor, 'translate(256.5, 166)')}

          {/* Left Front Door */}
          {renderPart('leftFrontDoor', paths.leftFrontDoor, 'translate(379.5, 164)')}

          {/* Left Front Fender */}
          {renderPart('leftFrontFender', paths.leftFrontFender, 'translate(494, 156)')}


          {/* Center / Top Items */}
          {/* Rear Bumper */}
          {renderPart('rearBumper', paths.rearBumper, 'translate(33, 271)')}

          {/* Trunk */}
          {renderPart('trunk', paths.trunk, 'translate(145, 299)')}

          {/* Roof */}
          {renderPart('roof', paths.roof, 'translate(261.92, 311.5)')}

          {/* Hood */}
          {renderPart('hood', paths.hood, 'translate(565, 282)')}

          {/* Front Bumper */}
          {renderPart('frontBumper', paths.frontBumper, 'translate(684, 271)')}
        </svg>
      </div>
    </div>
  );
};
