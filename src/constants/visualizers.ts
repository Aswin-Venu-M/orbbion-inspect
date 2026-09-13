import { InspectionState } from '@/components/ui/chassis-visualizer';

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

export type BodyPartStatusValue = 'good' | 'repaired' | 'damaged' | 'checked';

export interface BodyPartStatus {
  [key: string]: BodyPartStatusValue;
}

// 1. Chassis Visualizer Constants
export const CHASSIS_STATUS_COLORS: Record<InspectionState, string> = {
  pass: '#7FD159',
  fail: '#FE8E4B',
  weak: '#FFED00',
  na: '#D3D3D3',
} as const;

export const CHASSIS_WHEEL_POSITIONS = [
  { id: 'FL', label: 'FL', top: '33%', left: '56%' },
  { id: 'FR', label: 'FR', top: '48%', left: '72%' },
  { id: 'RL', label: 'RL', top: '61%', left: '28%' },
  { id: 'ST', label: 'ST', top: '73%', left: '35%' },
  { id: 'RR', label: 'RR', top: '77%', left: '45%' },
] as const;

export const CHASSIS_STATUS_LEGEND = [
  { label: 'Pass', color: '#7FD159', state: 'pass' },
  { label: 'Weak', color: '#FFED00', state: 'weak' },
  { label: 'Fail', color: '#FE8E4B', state: 'fail' },
  { label: 'Not Available', color: '#D3D3D3', state: 'na' },
] as const;

// 2. Car Body Blueprint Visualizer Constants
export const BODY_STATUS_COLORS: Record<BodyPartStatusValue, string> = {
  good: '#50E3C2',
  repaired: '#4A90E2',
  damaged: '#FF5A5F',
  checked: '#71D64B',
} as const;

export const INITIAL_BODY_PART_STATUSES: BodyPartStatus = {
  frontBumper: 'good',
  hood: 'good',
  roof: 'good',
  trunk: 'good',
  rearBumper: 'good',
  leftFrontFender: 'good',
  leftFrontDoor: 'good',
  leftBackDoor: 'good',
  leftRearFender: 'good',
  rightFrontFender: 'good',
  rightFrontDoor: 'good',
  rightBackDoor: 'good',
  rightRearFender: 'good',
};
export const BODY_PART_LABELS: Record<BodyPartId, string> = {
  frontBumper: 'Front Bumper',
  hood: 'Hood',
  roof: 'Roof',
  trunk: 'Trunk',
  rearBumper: 'Rear Bumper',
  leftFrontFender: 'Left Front Fender',
  leftFrontDoor: 'Left Front Door',
  leftBackDoor: 'Left Rear Door',
  leftRearFender: 'Left Rear Fender',
  rightFrontFender: 'Right Front Fender',
  rightFrontDoor: 'Right Front Door',
  rightBackDoor: 'Right Rear Door',
  rightRearFender: 'Right Rear Fender',
};

export const BODY_STATUS_LABELS: Record<BodyPartStatusValue, { label: string; description: string }> = {
  good: { label: 'Good', description: 'Original factory condition' },
  repaired: { label: 'Repaired', description: 'Repainted or reconditioned' },
  damaged: { label: 'Damaged', description: 'Dent, scratch, or deformity' },
  checked: { label: 'Checked', description: 'Inspected & verified' },
};

export const BODY_STATUS_LEGEND = [
  { label: 'Good / Original', color: '#50E3C2', state: 'good' as BodyPartStatusValue },
  { label: 'Repaired', color: '#4A90E2', state: 'repaired' as BodyPartStatusValue },
  { label: 'Damaged', color: '#FF5A5F', state: 'damaged' as BodyPartStatusValue },
  { label: 'Checked', color: '#71D64B', state: 'checked' as BodyPartStatusValue },
] as const;
