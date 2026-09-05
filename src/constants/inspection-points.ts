export const ELECTRICAL_INSPECTION_ITEMS = [
  'Gear Lever',
  'Doors',
  'Rear Windscreen',
  'Steering',
  'Key',
  'Infotainment',
  'Windows Operation',
  'Seats Adjustment',
  'Door Lock',
  'A/C Control & Cooling',
  'Cameras',
  'Gauges',
  'Rear View / Side Mirror',
  'A/C Grilles',
  'Ignition System',
  'Brake Lights',
  'Headlights',
  'Fog Lights',
  'Reverse Lights',
  'Number Plate Lights',
  'Indicators & Hazards',
  'Wipers',
  'Soft Closing Doors',
  'Interior Lights',
  'Cruise Control',
  'Horn',
  'Parking Sensors',
] as const;

export interface InteriorExteriorPoint {
  num: number;
  label: string;
}

export const INTERIOR_EXTERIOR_POINTS_CHUNK1: InteriorExteriorPoint[] = [
  { num: 1, label: 'Roof Lining' },
  { num: 2, label: 'Rear View Mirror' },
  { num: 3, label: 'Steering Wheel Upholstery' },
  { num: 4, label: 'Seats Upholstery' },
  { num: 5, label: 'Gear Lever' },
  { num: 6, label: 'Trunk Lining' },
];

export const INTERIOR_EXTERIOR_POINTS_CHUNK2: InteriorExteriorPoint[] = [
  { num: 7, label: 'Armrest & Side Pockets' },
  { num: 8, label: 'Dashboard' },
  { num: 9, label: 'Floor Mats' },
  { num: 10, label: 'Doors' },
  { num: 11, label: 'Front Windscreen' },
  { num: 12, label: 'Rear Windscreen' },
];

export const INTERIOR_EXTERIOR_POINTS_CHUNK3: InteriorExteriorPoint[] = [
  { num: 13, label: 'Side windows' },
  { num: 14, label: 'Hood' },
  { num: 15, label: 'Trunk' },
  { num: 16, label: 'Front Bumper' },
  { num: 17, label: 'Back Bumper' },
];

export const INTERIOR_EXTERIOR_POINTS = {
  chunk1: INTERIOR_EXTERIOR_POINTS_CHUNK1,
  chunk2: INTERIOR_EXTERIOR_POINTS_CHUNK2,
  chunk3: INTERIOR_EXTERIOR_POINTS_CHUNK3,
} as const;

export const ENGINE_INSPECTION_ITEMS = [
  'Engine Upper Cover',
  'Engine Shield Cover',
  'Engine Mounts',
  'Bonnet Hinge & Holder',
  'Fender Liners',
  'Drive Belt / Pulleys',
  'Engine Idle',
  'Engine Oil Filler Cap',
  'Engine Oil Leaks',
  'Engine Oil Condition',
  'Coolant Condition',
  'Coolant Cap',
  'Hoses & Pipes',
  'Exhaust System',
  '4 Wheel Drive',
] as const;

