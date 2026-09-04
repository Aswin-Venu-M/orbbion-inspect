"use client";

import React, { useState } from 'react';

export type BodyPartId = 
  | 'frontBumper'
  | 'hood'
  | 'roof'
  | 'trunk'
  | 'rearBumper'
  | 'leftFrontFender'
  | 'leftFrontDoor'
  | 'leftBackDoor'
  | 'leftRearFender'
  | 'rightFrontFender'
  | 'rightFrontDoor'
  | 'rightBackDoor'
  | 'rightRearFender';

export interface BodyPartStatus {
  [key: string]: 'good' | 'repaired' | 'damaged' | 'checked';
}

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
    const status = statuses[id] || 'good';
    switch (status) {
      case 'good': return '#50E3C2';
      case 'repaired': return '#4A90E2';
      case 'damaged': return '#FF5A5F';
      case 'checked': return '#71D64B';
      default: return '#50E3C2';
    }
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

  // Precise path data from SVG files
  const paths = {
    frontBumper: "M10 0.550303C14.8001 -1.04968 48.3334 1.21697 64.5 2.5503V205.05L10 208.05C6.99999 205.384 1.1 198.75 1.5 193.55H10C14.1667 192.05 22.5 186.95 22.5 178.55H11L16 118.05L22.5 111.55V97.0503L16 90.0503L11 30.0503H22.5C22.9999 25.3836 19.1999 15.6503 0 14.0503C1.33336 10.2169 5.20004 2.15029 10 0.550303ZM5.5 54.5503C8.5 76.717 12.7 128.55 5.5 158.55C3.5 128.717 0.700003 66.1503 5.5 54.5503ZM32 131.55H45V76.5503H32V131.55Z",
    rearBumper: "M1.5 2.55031C16.6667 1.21698 49.2 -1.04969 58 0.550309C66.5891 2.11197 77.1455 9.51844 81.6758 13.2818C81.4597 13.1919 81.2345 13.1143 81 13.0503C76.6 11.8503 75.5 13.5503 75.5 14.5503C75.5 15.3837 74.6999 17.7504 71.5 20.5503C67.5 24.0503 68.5 41.5503 69 49.0503C69.4 55.0503 74.8333 58.8836 77.5 60.0503V148.05C71.9 150.45 69.1667 157.05 68.5 160.05C68.5 165.05 69 177.05 71 185.05C73.0365 193.196 77.0637 196.365 80.3789 196.719C78.9915 197.543 77.526 198.482 76 199.55C66 206.55 57.5 210.05 38 209.05C22.4 208.25 7.16667 207.384 1.5 207.05L0 186.55C9.83334 183.05 29.7 174.25 30.5 167.05C31.3 159.85 31.8333 139.384 32 130.05V47.0503C32.1666 43.7169 30.2999 36.0503 21.5 32.0503C12.7 28.0503 6.16666 25.3836 4 24.5503C2.66666 23.8836 0 21.2503 0 16.0503C9.16109e-06 10.8503 1 4.88363 1.5 2.55031ZM92.5 18.0503V191.55C91.2484 191.743 88.6063 192.514 85.0557 194.21C85.9827 192.521 86.3996 190.356 86.5 189.05V160.05C86.5 154.85 83.8333 149.884 82.5 148.05C82 118.884 81.3 60.4503 82.5 60.0503C83.7 59.6503 85.6667 54.8836 86.5 52.5503V23.0503C86.5 20.631 85.6961 15.9301 82.7227 13.8599L92.5 18.0503ZM55 78.0503V131.05H68V78.0503H55Z",
    hood: "M35 0.0473362C20.2 0.447336 5.5 5.54734 0 8.04734C6 14.5473 18 39.1474 18 85.5474C18 131.947 6 166.547 0 178.047L18 184.047C24.6667 185.047 40.9 186.947 52.5 186.547C67 186.047 81 184.547 95 171.047C109 157.547 115 125.047 115.5 88.0474C116 51.0474 103.5 27.0474 97 17.0474C91.8 9.04736 81.8333 4.38068 77.5 3.04734C69.5 1.88067 49.8 -0.352664 35 0.0473362Z",
    roof: "M190.08 0C160.88 6.4 54.5798 5.66667 5.0798 4.5C-4.1202 37.7 1.24646 96.3333 5.0798 121.5C27.0798 119.5 137.58 124.333 190.08 127C208.48 67 197.746 17.3333 190.08 0Z",
    trunk: "M35 71.5C33 37.9 44.5 11.5 50.5 2.5C50.5 0.5 47.1667 0 45.5 0L11 1.5L4 10.5L17.5 7C16.8333 8.16667 14.4 12.3 10 19.5C2.5 30.5 0 57 0 87.5C0 111.9 11.6667 136 17.5 145L4 142C6.8 146 9.16667 148.333 10 149C16.3333 150.167 31.1 152.5 39.5 152.5C47.9 152.5 50.3333 150.167 50.5 149C38.5 140.5 37.5 113.5 35 71.5Z",
    leftFrontFender: "M122.5 2C127.3 45.6 97.5 59.1667 82 60.5C77.3333 62 64.3 61.9 49.5 49.5C34.7 37.1 32.6667 12.6667 33.5 2H13.5C12.1344 5.75539 6.05813 6.62123 1.92373 6.58707C1.29246 6.53023 0.650549 6.5 0 6.5C0.561593 6.54884 1.21406 6.58121 1.92373 6.58707C8.085 7.14191 13.2323 10.2323 15.5 12.5C18 15 21 40 22.5 56C23.7 68.8 21 83.6667 19.5 89.5C21.3333 89.3333 26.2 89.1 31 89.5C35.8 89.9 37.6667 92.6667 38 94L31 100L33.5 103.5L60.5 94C72.1 85.2 100 76.6667 112.5 73.5C123.5 60 176.5 39.5 176.5 37.5C175.3 31.1 170 24.5 167.5 22H163C152.6 22 147.333 17.6667 146 15.5L136 0H127C123.8 0 122.667 1.33334 122.5 2Z",
    leftFrontDoor: "M102 82.5L0 88L4.5 54.5L2.5 3C29 2 86.5 0 104.5 0C127 0 127 4 129.5 11C132 18 134 45 135 57C135.8 66.6 133 77.3333 131.5 81.5H120.5V76L119 74.5H108.5L107 76V82.5H102Z",
    leftBackDoor: "M0 86V93.5L121 86L125.5 53L123.5 0C111.167 0.5 82.7 1.5 67.5 1.5C52.3 1.5 43.5 12.1667 41 17.5L0 86Z",
    leftRearFender: "M75 3.99991C74.6 47.5999 103.167 59.1666 117.5 59.4999C161.5 59.4999 168.5 19.8333 166.5 0H186C186.4 4.39999 200.5 7.16661 207.5 7.99991C187.5 7.99991 178.167 19.3333 176 25L135 91.5V99.5C131.333 100.167 122.7 102 117.5 104C112.3 106 117 109.833 120 111.5L144.5 124L135 137C134.6 134.2 131.833 132.5 130.5 132L91.5 113.5L75 108.5L62.5 107C57.5 105.5 45.5 102.3 37.5 101.5C27.5 100.5 24 92.9999 25 92.9999C55.8 95.3999 67.8333 87.3332 70 82.9999L22 74.4999L21 69.9999C19 61.9999 14.1667 55.6666 12 53.4999L6 51.4999L0.5 46.4999L0 36.4999H4.5L7 34.4999L21 9.4999C24 9.16656 31.5 8.3999 37.5 7.99991C43.5 7.59991 65 5.16658 75 3.99991Z",
    rightFrontFender: "M122.5 101.5C127.3 57.9 97.5 44.3333 82 43C77.3333 41.5 64.3 41.6 49.5 54C34.7 66.4 32.6667 90.8333 33.5 101.5H13.5C12.1344 97.7446 6.05813 96.8788 1.92373 96.9129C1.29246 96.9698 0.650549 97 0 97C0.561593 96.9512 1.21406 96.9188 1.92373 96.9129C8.085 96.3581 13.2323 93.2677 15.5 91C18 88.5 21 63.5 22.5 47.5C23.7 34.7 21 19.8333 19.5 14C21.3333 14.1667 26.2 14.4 31 14C35.8 13.6 37.6667 10.8333 38 9.5L31 3.5L33.5 0L60.5 9.5C72.1 18.3 100 26.8333 112.5 30C123.5 43.5 176.5 64 176.5 66C175.3 72.4 170 79 167.5 81.5H163C152.6 81.5 147.333 85.8333 146 88L136 103.5H127C123.8 103.5 122.667 102.167 122.5 101.5Z",
    rightFrontDoor: "M102 5.5L0 0L4.5 33.5L2.5 85C29 86 86.5 88 104.5 88C127 88 127 84 129.5 77C132 70 134 43 135 31C135.8 21.4 133 10.6667 131.5 6.5H120.5V12L119 13.5H108.5L107 12V5.5H102Z",
    rightBackDoor: "M0 7.5V0L121 7.5L125.5 40.5L123.5 93.5C111.167 93 82.7 92 67.5 92C52.3 92 43.5 81.3333 41 76L0 7.5Z",
    rightRearFender: "M75 133C74.6 89.4001 103.167 77.8334 117.5 77.5001C161.5 77.5001 168.5 117.167 166.5 137H186C186.4 132.6 200.5 129.833 207.5 129C187.5 129 178.167 117.667 176 112L135 45.5V37.5C131.333 36.8333 122.7 35 117.5 33C112.3 31 117 27.1667 120 25.5L144.5 13L135 0C134.6 2.8 131.833 4.5 130.5 5L91.5 23.5L75 28.5L62.5 30C57.5 31.5 45.5 34.7 37.5 35.5C27.5 36.5 24 44.0001 25 44.0001C55.8 41.6001 67.8333 49.6668 70 54.0001L22 62.5001L21 67.0001C19 75.0001 14.1667 81.3334 12 83.5001L6 85.5001L0.5 90.5001L0 100.5H4.5L7 102.5L21 127.5C24 127.833 31.5 128.6 37.5 129C43.5 129.4 65 131.833 75 133Z"
  };

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
          {/* ============================================================ */}
          {/* BOTTOM SIDE VIEW (Wheels DOWN) — Right side panels           */}
          {/* Car faces RIGHT. Rear at left ~X=108, Front at right ~X=680  */}
          {/* Side profile body occupies approx Y: 330 to 490             */}
          {/* ============================================================ */}

          {/* Right Rear Fender — native 208×137 */}
          {renderPart('rightRearFender', paths.rightRearFender,
            'translate(108, 345) scale(0.88, 0.88)'
          )}

          {/* Right Back Door — native 126×94 */}
          {renderPart('rightBackDoor', paths.rightBackDoor,
            'translate(275, 360) scale(0.92, 0.92)'
          )}

          {/* Right Front Door — native 136×88 */}
          {renderPart('rightFrontDoor', paths.rightFrontDoor,
            'translate(385, 358) scale(0.92, 0.92)'
          )}

          {/* Right Front Fender — native 177×104 */}
          {renderPart('rightFrontFender', paths.rightFrontFender,
            'translate(500, 345) scale(0.88, 0.88)'
          )}

          {/* ============================================================ */}
          {/* TOP SIDE VIEW (Wheels UP) — Left side panels                 */}
          {/* Car faces RIGHT. Same X positions, Y flipped.               */}
          {/* Side profile body occupies approx Y: 20 to 180              */}
          {/* scale(sx, -sy) flips vertically; translate Y is the bottom  */}
          {/* ============================================================ */}

          {/* Left Rear Fender — native 208×137, flipped */}
          {renderPart('leftRearFender', paths.leftRearFender,
            'translate(108, 170) scale(0.88, -0.88)'
          )}

          {/* Left Back Door — native 126×94, flipped */}
          {renderPart('leftBackDoor', paths.leftBackDoor,
            'translate(275, 153) scale(0.92, -0.92)'
          )}

          {/* Left Front Door — native 136×88, flipped */}
          {renderPart('leftFrontDoor', paths.leftFrontDoor,
            'translate(385, 152) scale(0.92, -0.92)'
          )}

          {/* Left Front Fender — native 177×104, flipped */}
          {renderPart('leftFrontFender', paths.leftFrontFender,
            'translate(500, 167) scale(0.88, -0.88)'
          )}

          {/* Top Roof Arch (thin strip between top car and center) */}
          {renderPart('roof', paths.roof,
            'translate(282, 175) scale(1.22, -0.30)'
          )}

          {/* ============================================================ */}
          {/* CENTER TOP VIEW — Trunk, Roof, Hood                         */}
          {/* ============================================================ */}

          {/* Rear Bumper — native 93×210, positioned at left edge */}
          {renderPart('rearBumper', paths.rearBumper,
            'translate(28, 148) scale(0.82, 0.82)'
          )}

          {/* Trunk — native 51×153, rotated -90° for horizontal layout */}
          {renderPart('trunk', paths.trunk,
            'translate(140, 180) scale(1.85, 0.82) rotate(-90)'
          )}

          {/* Center Roof — native 201×127 */}
          {renderPart('roof', paths.roof,
            'translate(256, 180) scale(1.22, 1.22)'
          )}

          {/* Hood — native 116×187, rotated 90° for horizontal layout */}
          {renderPart('hood', paths.hood,
            'translate(510, 170) scale(1.52, 0.95) rotate(90)'
          )}

          {/* Front Bumper — native 65×209, positioned at right edge */}
          {renderPart('frontBumper', paths.frontBumper,
            'translate(690, 148) scale(0.82, 0.82)'
          )}

        </svg>
      </div>
    </div>
  );
};
